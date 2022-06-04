window.onload = function() {
    document.addEventListener('keydown', changeDirection);
    setInterval(loop, 1000/60); // пока 60 FPS - temporarily 60 FPS
}

var 
    canv              = document.getElementById('mc'), // холст - canvas
    ctx               = canv.getContext('2d'), // 2d окружение - 2d context
    gs = fkp          = false, // игра запущена && первая клавиша нажата (состояния инициализации) - game started && first key pressed (initialization states)
    speed = baseSpeed = 3, //скорость передвижения змеи - snake movement speed
    xv = yv           = 0, // скорость (x & y) - velocity (x & y)
    px                = ~~(canv.width) / 2, // позиция игрока по оси x - player x position
    py                = ~~(canv.height) / 2, // позиция игрока по оси y - player y position
    pw = ph           = 20, // размер игрока - player size
    aw = ah           = 20, // размер яблока - apple size
    apples            = [], // список яблок - apple list
    trail             = [], // список элементов хвоста (след) - tail elements list (trail)
    tail              = 10, // размер хвоста - tail size
    tailSafeZone      = 20, // защита от самосъедания для зоны головы (safeZone) - self eating protection for head zone (safeZone)
    cooldown          = false, // является ключевым в режиме восстановления - is key in cooldown mode
    score             = 0; // текущий счет - current score

// основной цыкл игры - game main loop
function loop() {
    // логика - logic
    ctx.fillStyle = '#483D8B';
    ctx.fillRect(0, 0, canv.width, canv.height);

    // скорость силы - force speed
    px += xv;
    py += yv;

    // телепорты - teleports
    if( px > canv.width)
        {px = 0;}
    if( px + pw < 0)
        {px = canv.width;}
    if( py + ph < 0)
        {py = canv.height;}
    if( py > canv.height)
        {py = 0;}

    // окрас земли в цвет элементов хвоста - color of the ground in the color of the elements of the tail
    ctx.fillStyle = 'gold';
    for( var i = 0; i < trail.length; i++)
    {
        ctx.fillStyle = trail[i].color || 'gold';
        ctx.fillRect( trail[i].x, trail[i].y, pw, ph);
    }
    trail.push({ x: px, y: py, color: ctx.fillStyle});

    // ограничитель - limiter
    if( trail.length > tail)
        {trail.shift();}
    
    // съедание - eating
    if( trail.length > tail)
        {trail.shift();}
    
    // самостолкновение - self collision
    if( trail.length >= tail && gs)
        {
            for( var i = trail.length - tailSafeZone; i >= 0; i--)
                {
                    if( 
                        px < (trail[i].x + pw) 
                        && 
                        px + pw > trail[i].x 
                        && 
                        py < (trail[i].y + ph)
                        && 
                        py + ph > trail[i].y
                    )
                    {
                        // получил столкновение - got collision
                        tail = 10; // отрегулировать хвост - adjust the tail
                        speed = baseSpeed; // отрегулировать скорость - adjust the speed

                        for( var t = 0; t < trail.length; t++)
                        {
                            // выделить свободное место - highlight loosed area
                            trail[t].color = 'red';

                            if( t >= trail.length - tail)
                                {break;}
                        }
                    }
                }
        }

        // окраска яблок - paint apples
        for( var a = 0; a < apples.length; a++)
        {
            ctx.fillStyle = apples[a].color;
            ctx.fillRect( apples[a].x, apples[a].y, aw, ah);
        }

        // проверить наличие столкновений змеиной головы с яблоками - check for snake head collisions with apples
        for( var a= 0; a < apples.length; a++)
        {
            if(
                px < (apples[a].x + pw)
                &&
                px + pw > apples[a].x
                &&
                py < (apples[a].y + ph)
                &&
                py + ph > apples[a].y
            )
            {
                // получил столкновение с яблоком - got collision with apple
                apples.splice(a, 1); // удалить это яблоко из списка яблок - remove this apple from the apples list
                tail += 5; // добавить длину хвоста - add tail length
                speed += .05; // добавить немного скорости - add some speed
                spawnApple(); // созать ещё яблок - spawn another apples
                break;
            }
        }
}

// созидатель яблок - apples spawner
function spawnApple(){
    var 
        newApple = {
            x: ~~(Math.random() * canv.width),
            y: ~~(Math.random() * canv.height),
            color: 'red'
        };

    // запрет спауна возле краев - ban spawning near edges
    if(
        (newApple.x < aw || newApple.x > canv.width - aw)
        ||
        (newApple.y < ah || newApple.y > canv.height - ah)
    )
    {
        spawnApple();
        return;
    }

    // проверить на столкновение с хвостовым элементом, чтобы в нем не появлялось яблоко - check for collision with tail element, so no apple will be spawned in it
    for( var i = 0; i < tail.length; i++)
    {
        if(
            newApple.x < (trail[i].x + pw)
            &&
            newApple.x + aw > trail[i].x
            &&
            newApple.y < (trail[i].y + ph)
            &&
            newApple.y + ah > trail[i].y
        )
        {
            // получил столкновение - got collision
            spawnApple();
            return;
        }
    }
    apples.push(newApple);

    if( apples.length < 3 && ~~(Math.random() * 1000) > 800)
    {
        // 20% шанс породить еще одно яблоко - 20% chance to spawn one more apple
        spawnApple();
    }
}

// генератор случайных крутых моментов (для отладки или просто для 4fun) - random cool generator (for debugging purpose or just 4fun)
function rc(){
    return '#' + ((~~(Math.random() * 255)).toString(16)) 
               + ((~~(Math.random() * 255)).toString(16)) 
               + ((~~(Math.random() * 255)).toString(16));
}

// переключатель скоростей - velocity changer (controls)
function changeDirection(evt) {
    if( !fkp && [37, 38, 39, 40].indexOf(evt.keyCode) > -1)
        {
            setTimeout(function() {gs = true;}, 1000);
            fkp = true;
            spawnApple();
        }
    if(cooldown)
        {return false;}
    /*
        4 направления движения - 4 directional movement
    */
    if( evt.keyCode == 37 && !(xv > 0)) // стрелка влево - left arrow
        {xv = -speed; yv = 0;}
    if( evt.keyCode == 38 && !(yv > 0)) // стрелка вверх - top arrow
        {xv = 0; yv = -speed;}
    if( evt.keyCode == 39 && !(xv < 0)) // стрелка вправо - right arrow
        {xv = speed; yv = 0;}
    if( evt.keyCode == 40 && !(yv < 0)) // стрелка вниз - down arrow
        {xv = 0; yv = speed;}
    
    cooldown = true;
    setTimeout( function() {cooldown = false;}, 100);
}
