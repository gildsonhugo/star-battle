class Sprite{
    constructor(sourceX, SourceY, width, height, x, y){
        this.sourceX = sourceX;
        this.sourceY = SourceY;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.NORMAL = 1;
        this.EXPLODED = 2;
        this.state = this.NORMAL;
        this.numberOfFrames = 1;
        this.tickCount = 0;
        this.tiksPerFrame = 0;
        this.frameIndex = 0;
        this.loop = false;
        this.numberShots = 0;
    }

    halfWidth(){
        return (this.numberOfFrames > 1) ? (this.width/this.numberOfFrames)/2 : this.width/2;
    }

    halfHeight(){
        return this.height/2;
    }

    update(ctx, sprites){

    }

    centerX(){
        return this.x+this.halfWidth();
    }

    centerY(){
        return this.y+this.halfHeight();
    }

    move(){
        this.x += this.vx;
        this.y += this.vy;
    }

    loopSprite(){
        this.tickCount++;
        if(this.tickCount >= this.tiksPerFrame){
            this.tickCount = 0;
            if(this.frameIndex < this.numberOfFrames-1){
                this.frameIndex++;
            }else if(this.loop){
                this.frameIndex = 0;
            }
        }
    }

    explode(){
        this.sourceX = 805;
        this.sourceY = 0;
        this.width = 75;
        this.vx = 0;
        this.vy = 0;
        this.height = 72;
        this.state = this.EXPLODED;
        this.numberOfFrames = 1
    }

}

class Defender extends Sprite{
    constructor(...params){
        super(...params);
    }

    update(ctx, sprites){
        this.x = Math.max(0, Math.min(this.x+this.vx, ctx.canvas.width-this.width));
        this.y = Math.max(0, Math.min(this.y+this.vy, ctx.canvas.height-this.height));
        sprites.forEach(s=>{
            if(s != this){
                if(collide(s, this)){
                    if(s instanceof Fuel){
                        ctx.modifyFuel(15);
                        ctx.removeObject(s);
                    }
                    if(s instanceof Alien && s.state != s.EXPLODED || s instanceof Asteroid && s.state != s.EXPLODED){
                        s.explode();
                        ctx.playSound('explosion');
                        ctx.modifyFuel(-15);
                        setTimeout(()=>{
                            ctx.removeObject(s);
                        }, 1000)
                    }
                    if(s instanceof BadMissile){
                        ctx.modifyFuel(-15);
                        ctx.removeObject(s);
                    }
                }
            }
        })
    }
}

class Missile extends Sprite{
    constructor(...params){
        super(...params);
    }
    update(ctx, sprites){
        if(this.x > ctx.canvas.width) ctx.removeObject(this);
    }
}

class BadMissile extends Sprite{
    constructor(...params){
        super(...params);
    }
    update(ctx, sprites){
        if(this.x < -this.width) ctx.removeObject(this);
    }
}

class Alien extends Sprite{
    constructor(...params){
        super(...params);
    }
    update(ctx, sprites){
        this.loopSprite();
        if(this.state != this.EXPLODED){
            if(Math.floor(Math.random()*1000000) < 10000) ctx.badShoot(this);
        }
        if(this.x < -this.width) ctx.removeObject(this);
        sprites.forEach(s=>{
            if(s != this){
                if(collide(s, this)){
                    if(s instanceof Missile && this.state != this.EXPLODED){
                        this.explode();
                        ctx.playSound('explosion');
                        ctx.removeObject(s);
                        ctx.modifyScore(5)
                        setTimeout(()=>{
                            ctx.removeObject(this);
                        }, 1000)

                    }
                }
            }
        })
    }

}

class Friend extends Sprite{
    constructor(...params){
        super(...params);
    }
    update(ctx, sprites){
        this.loopSprite();
        if(this.x < -this.width) ctx.removeObject(this);
        sprites.forEach(s=>{
            if(s != this){
                if(collide(s, this)){
                    if(s instanceof Missile && this.state != this.EXPLODED){
                        this.explode();
                        ctx.playSound('explosion');
                        ctx.removeObject(s);
                        ctx.modifyScore(-10)
                        setTimeout(()=>{
                            ctx.removeObject(this);
                        }, 1000)

                    }
                }
            }
        })
    }
}

class Fuel extends Sprite{
    constructor(...params){
        super(...params);
    }
    update(ctx, sprites){
        if(this.y > ctx.canvas.height) ctx.removeObject(this);
    }
}

class Asteroid extends Sprite{
    constructor(...params){
        super(...params);
    }
    update(ctx, sprites){
        if(this.x < -this.width) ctx.removeObject(this);
        sprites.forEach(s=>{
            if(s != this){
                if(collide(s, this)){
                    if(s instanceof Missile && this.state != this.EXPLODED){
                        this.numberShots++;
                        ctx.removeObject(s);
                        if(this.numberShots == 2){
                            this.explode();
                            ctx.playSound('explosion');
                            ctx.modifyScore(10);
                            setTimeout(()=>{
                                ctx.removeObject(this);
                            }, 1000)
                        }
                    }
                }
            }
        })
    }
}