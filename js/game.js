class Game{
    constructor(){
        this.canvas = document.getElementById('canvasGame');
        this.ctx = this.canvas.getContext('2d');
        this.paused = false;
        this.over = false;
        this.mainImage = new Image();
        this.mainImage.src = 'img/sprites.png';
        this.defender = null;
        this.sprites = [];
        this.mainInterval = null;
        this.fuel = 15;
        this.score = 0;
        this.time = 0;
        this.indexesFuel = [880, 916, 951, 986, 1021, 1056, 1091].reverse();
        this.fuelIndicator = null;
        this.bgSound = new Audio();
        this.muted = false;
        this.timers = [
            {count: 0, timer: 300, obj: 'fuel'},
            {count: 0, timer: 500, obj: 'alien'},
            {count: 0, timer: 600, obj: 'friend'},
            {count: 0, timer: 800, obj: 'asteroid'},
        ];
        this.spaceIsDown = false;
        this.ranking = [];
    }

    init(){

        this.bgSound.src = "sound/background.mp3";

        this.generateDefender();
        this.generateFuelInd();
        this.startMainInterval();
        this.startListeners();
        this.loop();
    }

    loop(){
        if(this.fuel == 0){
            this.overTheGame();
            return false;
        }
        window.requestAnimationFrame(this.loop.bind(this), this.ctx);
        if(!this.paused && !this.over){
            this.update();
        }
        this.render();
    }

    togglePause(){
        this.paused = !this.paused;
        if(this.paused){
            $('#pause-play').addClass('paused');
            $('.box-game').addClass('paused');
            $('.bg-planets > div').addClass('paused');
            this.bgSound.pause();
        }else{
            $('#pause-play').removeClass('paused');
            $('.box-game').removeClass('paused');
            $('.bg-planets > div').removeClass('paused');
            this.bgSound.play();
        }
    }

    update(){
        this.timers.forEach(t=>{
            t.count++;
            if(t.count == t.timer){
                t.count = 0;
                switch (t.obj){
                    case 'fuel':
                        this.generateFuel();
                        break;
                    case 'alien':
                        this.generateAlien();
                        break;
                    case 'friend':
                        this.generateFriend();
                        break;
                    case 'asteroid':
                        this.generateAsteroid();
                        break;
                }
            }
        });
        this.sprites.forEach(spr=>{
            spr.move();
            spr.update(this, this.sprites);
        })
    }

    mute(){
        if(this.paused) return false;
        $('#sound-mute').addClass('muted');
        this.bgSound.volume = 0;
    }

    unMute(){
        if(this.paused) return false;
        $('#sound-mute').removeClass('muted');
        this.bgSound.volume = 1;
    }

    overTheGame(){
        this.mute();
        this.paused = true;
        this.over = true;
        goToBoard('over');
    }

    startMainInterval(){
        this.mainInterval = setInterval(()=>{
            if(!this.paused){
                this.updateTimer();
                this.modifyFuel(-1);
            }
        }, 1000);
    }

    updateTimer(){
        this.time++;
        $('#int-time').html(this.time);
    }

    modifyFuel(value){
        this.fuel += value;
        this.fuel = Math.min(30, Math.max(0, this.fuel));
        $("#ind-fuel").html(this.fuel);
        this.fuelIndicator.sourceX = this.indexesFuel[Math.floor(this.fuel/5)];
    }

    modifyScore(value){
        this.score += value;
        $("#ind-score").html(this.score);
    }

    generateFuelInd(){
        this.fuelIndicator = new Sprite(this.indexesFuel[Math.floor(this.fuel/5)], 0, 37, 172, 222, 418);
        this.sprites.push(this.fuelIndicator);
    }

    generateDefender(){
        this.defender = new Defender(0,0,68,56,0, (this.canvas.height/2)-28);
        this.sprites.push(this.defender);
    }

    generateFuel(){
        let posFuel = Math.floor(Math.random()*24)*40;
        let fuel = new Fuel(704,0,40,46, posFuel, 0);
        fuel.vy = 5;
        this.sprites.push(fuel);
    }

    generateAsteroid(){
        let posAst = Math.floor(Math.random()*11)*51;
        let asteroid = new Asteroid(744,0,61,51, this.canvas.width-61, posAst);
        asteroid.vx = -4;
        this.sprites.push(asteroid);
    }

    generateAlien(){
        let posAlien = Math.floor(Math.random()*7)*82;
        let alien = new Alien(66, 0, 318, 82, this.canvas.width-61, posAlien);
        alien.vx = -5;
        alien.numberOfFrames = 4;
        alien.loop = true;
        alien.tiksPerFrame = 2;
        this.sprites.push(alien);
    }
    generateFriend(){
        let posFriend = Math.floor(Math.random()*7)*82;
        let friend = new Friend(384, 0, 318, 82, this.canvas.width-61, posFriend);
        friend.vx = -5;
        friend.numberOfFrames = 4;
        friend.loop = true;
        friend.tiksPerFrame = 2;
        this.sprites.push(friend);
    }
    shoot(){
        if(this.paused) return false;
        this.playSound('fire');
        let missile = new Missile(704, 47, 9, 6, this.defender.x+this.defender.width, this.defender.y+this.defender.halfHeight());
        missile.vx = 10;
        this.sprites.push(missile);
    }
    badShoot(alien){
        let badmissile = new BadMissile(715,47, 9,6, alien.x, alien.y+alien.halfHeight());
        badmissile.vx = -10;
        this.sprites.push(badmissile);
    }

    incrementFont(){
        $('.fonts *').css({
            fontSize: "+=1px",
        });
    }

    decrementFont(){
        $('.fonts *').css({
            fontSize: "-=1px",
        });
    }

    removeObject(object){
        let index = this.sprites.indexOf(object);
        if(index != -1){
            this.sprites.splice(index, 1);
        }
    }

    sendData(e){

        let transaction = connection.transaction(['ranking'], 'readwrite');

        let store = transaction.objectStore('ranking');

        let result = {name: new FormData(e.target).get('name'), time: this.time, score: this.score};

        let request = store.add(result);

        request.onsuccess = e => {
            this.getRanking();
        }

        request.onerror = e =>{
            console.log(e.target.error);
        }

        // formData.append('time', this.time);
        // formData.append('score', this.score);
        // fetch(e.target.action, {
        //     method: 'post',
        //     body: formData
        // }).then(r=>r.json()).then(list=>{
        //     let content = list.map((item,index) =>{
        //         return `<tr><td>${index+1}</td><td>${item.name}</td><td>${item.score}</td><td>${item.time}</td></tr>`;
        //     });
        //     $('#ranking table tbody').html(content.join(""));
        //
        // });
    }

    getRanking(){

        let end = false;

        let transaction = connection.transaction(['ranking'], 'readwrite');

        let store = transaction.objectStore('ranking');

        let cursor = store.openCursor();

        cursor.onsuccess = e =>{
            let atual = e.target.result;
            if(atual){
                let data = atual.value;
                this.ranking.push(data);
                atual.continue();
            }else{
                this.listRanking();
            }
        }

        cursor.onerror = e =>{
            console.log(e.target.error.name);
        }

    }

    listRanking(){

        this.ranking = this.ranking.sort((a,b) => b.score-a.score);

        console.log(this.ranking);

        let content = this.ranking.map((item,index) => {
            return `<tr><td>${index+1}</td><td>${item.name}</td><td>${item.score}</td><td>${item.time}</td></tr>`;
        });

        $('#ranking table tbody').html(content.join(""));

        goToBoard('ranking');
    }

    render(){
        if(this.sprites.length > 0){
            this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
            this.sprites.forEach((sprite)=>{
                if(sprite.numberOfFrames > 1){
                    this.ctx.drawImage(this.mainImage, sprite.sourceX+(sprite.frameIndex*(sprite.width/sprite.numberOfFrames)), sprite.sourceY, (sprite.width/sprite.numberOfFrames), sprite.height, sprite.x, sprite.y, (sprite.width/sprite.numberOfFrames), sprite.height);
                }else{
                    this.ctx.drawImage(this.mainImage, sprite.sourceX, sprite.sourceY, sprite.width, sprite.height, sprite.x, sprite.y, sprite.width, sprite.height);
                }
            });
        }
    }

    playSound(type){
        if(!this.muted && !this.paused){
            let audio = new Audio();
            switch (type){
                case 'fire':
                    audio.src = "sound/shoot.mp3";
                    break;
                case 'explosion':
                    audio.src = "sound/destroyed.mp3";
                    break;
            }
            audio.addEventListener('canplaythrough', function(){
                this.play();
            });
        }
    }

    startListeners(){

        document.addEventListener('keydown', e=>{
            switch (e.keyCode){
                case 32:
                    if(!this.spaceIsDown){
                        this.shoot();
                        this.spaceIsDown = true;
                    }
                    break;
                case 80:
                    this.togglePause();
                    break;
                case 38:
                    if(this.paused)return false;
                    this.defender.vy = -5;
                    break;
                case 40:
                    if(this.paused)return false;
                    this.defender.vy = 5;
                    break;
                case 39:
                    if(this.paused)return false;
                    this.defender.vx = 5;
                    break;
                case 37:
                    if(this.paused)return false;
                    this.defender.vx = -5;
                    break;

           }
        });

        document.addEventListener('keyup', e=>{
            switch (e.keyCode){
                case 32:
                    this.spaceIsDown = false;
                    break;
                default:
                    if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40){
                        this.defender.vx = 0;
                        this.defender.vy = 0;
                    }
                    break;
            }
        });

        $('.control').on('mouseenter', (e)=>{
            let id = e.target.id;
            switch (id){
                case 'up':
                    this.defender.vy = -5;
                    break;
                case 'down':
                    this.defender.vy = 5;
                    break;
                case 'left':
                    this.defender.vx = -5;
                    break;
                case 'right':
                    this.defender.vx = 5;
                    break;
            }
        });

        $('.control').on('mouseleave', (e)=>{
            this.defender.vx = 0;
            this.defender.vy = 0;
        });

        $('#input-name').on('input', (e)=>{
           if($(e.target).val() != '') {
               $('.btn-submit').removeAttr('disabled');
               return false;
           }
            $('.btn-submit').attr('disabled', true);
        });
        $('#formOver').on('submit', (e)=>{
            e.preventDefault();
            this.sendData(e);
        });

        $('#pause-play').on('click', (e)=>{
            this.togglePause();
        });

        $('#sound-mute').on('click', (e)=>{
            if(this.muted){
                this.unMute();
            }else{
                this.mute();
            }
            this.muted = !this.muted;
        });

        this.bgSound.addEventListener('canplaythrough', function(){
            this.setAttribute('loop', true);
           this.play();
        });

    }
}
