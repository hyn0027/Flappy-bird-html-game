const Bird = Hilo.Class.create({
    Extends: Hilo.Sprite,

    constructor: function (properties) {
        Bird.superclass.constructor.call(this, properties);

        this.addFrame(properties.atlas.getSprite('bird'));
        this.interval = 6;
        this.pivotX = 43;
        this.pivotY = 30;

        this.gravity = 10 / 1000 * 0.3;
        this.flyHeight = 80;
        this.initVelocity = Math.sqrt(2 * this.flyHeight * this.gravity);
    },

    startX: 0, //小鸟的起始x坐标
    startY: 0, //小鸟的起始y坐标
    groundY: 0, //地面的坐标
    gravity: 0, //重力加速度
    flyHeight: 0, //小鸟每次往上飞的高度
    initVelocity: 0, //小鸟往上飞的初速度

    isDead: true, //小鸟是否已死亡
    isUp: false, //小鸟是在往上飞阶段，还是下落阶段
    flyStartY: 0, //小鸟往上飞的起始y轴坐标
    flyStartTime: 0, //小鸟飞行起始时间

    getReady: function () {
        //设置起始坐标
        this.x = this.startX;
        this.y = this.startY;

        this.rotation = 0;
        this.interval = 6;
        this.play();
        this.tween = Hilo.Tween.to(this, {y: this.y + 10, rotation: -8}, {duration: 400, reverse: true, loop: true});
    },

    startFly: function () {
        this.isDead = false;
        this.interval = 3;
        this.flyStartY = this.y;
        this.flyStartTime = +new Date();
        if (this.tween) this.tween.stop();
    },

    onUpdate: function () {
        if (this.isDead) return;

        const time = (+new Date()) - this.flyStartTime;

        const dist = this.initVelocity * time - 0.5 * this.gravity * time * time;

        if (this.flyStartY - dist <= this.groundY) {
            this.y = this.flyStartY - dist;
        } else {
            this.y = this.groundY;
            this.isDead = true;
        }
    }
});
