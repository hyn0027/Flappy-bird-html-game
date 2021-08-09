const ReadyScene = Hilo.Class.create({
    Extends: Hilo.Container,

    constructor: function (properties) {
        ReadyScene.superclass.constructor.call(this, properties);

        // 标题 Get Ready!
        const getReady = new Hilo.Bitmap({
            image: properties.image,
            rect: [0, 0, 508, 158]
        });

        // tap 的提示
        const tap = new Hilo.Bitmap({
            image: properties.image,
            rect: [0, 158, 286, 246]
        });

        // 确定图片元素的位置
        tap.x = this.width - tap.width >> 1;
        tap.y = this.height - tap.height + 40 >> 1;
        getReady.x = this.width - getReady.width >> 1;
        getReady.y = tap.y - getReady.height >> 0;

        this.addChild(tap, getReady);
    },
});
