window.onload = function () {
    game.init();
}

const game = window.game = {
    width: 0,
    height: 0,

    asset: null,
    stage: null,
    ticker: null,
    state: null,  // 'ready', 'playing', 'over'
    score: 0,

    bg: null,
    ground: null,
    bird: null,
    holdbacks: null,
    gameReadyScene: null,
    gameOverScene: null,

    init: function () {
        this.asset = new Asset();
        this.asset.load();
        this.asset.on('complete', () => {
            this.asset.off('complete');
            this.initStage();
        });
    },

    initStage: function () {
        this.width = Math.min(innerWidth, 450) * 2;
        this.height = Math.min(innerHeight, 750) * 2;
        this.scale = 0.5;

        //舞台画布
        const canvas = Hilo.createElement('canvas');

        //舞台
        this.stage = new Hilo.Stage({
            canvas: canvas,
            width: this.width,
            height: this.height,
            scaleX: this.scale,
            scaleY: this.scale
        }).addTo(document.body);

        //启动计时器
        this.ticker = new Hilo.Ticker(60);
        this.ticker.addTick(Hilo.Tween);
        this.ticker.addTick(this.stage);
        this.ticker.start(true);

        //绑定交互事件
        this.stage.enableDOMEvent(Hilo.event.POINTER_START, true);
        this.stage.on(Hilo.event.POINTER_START, () => {
            if (this.state === 'ready') {
                this.state = 'playing';
                this.gameReadyScene.visible = false;
                this.holdbacks.startMove();
            }
            if (this.state === 'playing') {
                this.bird.startFly();
            }
        });

        //舞台更新
        this.stage.onUpdate = () => {
            // TODO
            if (this.state === 'playing' && this.bird.isDead) {
                this.gameOver();
            }
            this.currentScore.setText(this.calcScore());
        }

        //初始化
        this.initBackground();
        this.initHoldbacks();
        this.initBird();
        this.initScenes();

        //准备游戏
        this.gameReady();
    },

    initBackground: function () {
        const bgImg = this.asset.bg;
        this.bg = new Hilo.Bitmap({
            id: 'bg',
            image: bgImg,
            scaleX: this.width / bgImg.width,
            scaleY: this.height / bgImg.height
        }).addTo(this.stage);

        //地面
        const groundImg = this.asset.ground;
        const groundOffset = 60;
        this.ground = new Hilo.Bitmap({
            id: 'ground',
            image: groundImg,
            scaleX: (this.width + groundOffset * 2) / groundImg.width
        }).addTo(this.stage);

        //设置地面的y轴坐标
        this.ground.y = this.height - this.ground.height;

        //移动地面
        Hilo.Tween.to(this.ground, {x: -groundOffset * this.ground.scaleX}, {duration: 400, loop: true});

        //当前分数
        this.currentScore = new Hilo.BitmapText({
            id: 'score',
            glyphs: this.asset.numberGlyphs,
            textAlign: 'center'
        }).addTo(this.stage);

        //设置当前分数的位置
        this.currentScore.x = this.width - this.currentScore.width >> 1;
        this.currentScore.y = 180;
    },

    initBird: function () {
        this.bird = new Bird({
            id: 'bird',
            atlas: this.asset.birdAtlas,
            startX: 100,
            startY: this.height >> 1,
            groundY: this.ground.y - 12
        }).addTo(this.stage, this.ground.depth - 1);
    },

    initHoldbacks: function () {
        this.holdbacks = new Holdbacks({
            id: 'holdbacks',
            image: this.asset.holdback,
            height: this.height,
            startX: this.width + 200,
            groundY: this.ground.y
        }).addTo(this.stage, this.ground.depth - 1);
    },

    initScenes: function () {
        //准备场景
        this.gameReadyScene = new ReadyScene({
            id: 'readyScene',
            width: this.width,
            height: this.height,
            image: this.asset.ready
        }).addTo(this.stage);

        //结束场景
        this.gameOverScene = new OverScene({
            id: 'overScene',
            width: this.width,
            height: this.height,
            image: this.asset.over,
            numberGlyphs: this.asset.numberGlyphs,
            visible: false
        }).addTo(this.stage);

        //绑定开始按钮事件
        this.gameOverScene.getChildById('start').on(Hilo.event.POINTER_START, (e) => {
            e.stopImmediatePropagation && e.stopImmediatePropagation();
            this.gameReady();
        });
    },

    gameReady: function () {
        this.gameOverScene.hide();
        this.state = 'ready';
        this.score = 0;
        this.currentScore.visible = true;
        this.currentScore.setText(this.score);
        this.gameReadyScene.visible = true;
        this.holdbacks.reset();
        this.bird.getReady();
    },

    gameOver: function () {
        if (this.state !== 'over') {
            //设置当前状态为结束over
            this.state = 'over';
            //停止障碍的移动
            this.holdbacks.stopMove();
            //小鸟跳转到第一帧并暂停
            this.bird.goto(0, true);
            //隐藏屏幕中间显示的分数
            this.currentScore.visible = false;
            //显示结束场景
            this.gameOverScene.show(this.calcScore(), this.saveBestScore());
        }
    },

    calcScore: function () {
        const count = this.holdbacks.calcPassThrough(this.bird.x);
        return this.score = count;
    },

    saveBestScore: function () {
        let best = 0;
        if (Hilo.browser.supportStorage) {
            best = parseInt(localStorage.getItem('hilo-flappy-best-score')) || 0;
        }
        if (this.score > best) {
            best = this.score;
            localStorage.setItem('hilo-flappy-best-score', this.score);
        }
        return best;
    }
};
