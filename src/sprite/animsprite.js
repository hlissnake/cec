//Frame Animation Sprite
KISSY.add(function (S, RectSprite) {
	/**
	 * animConfig: {
	 *		name:,
	 * 		autoPlay: true,
	 * 		loop: true,
	 * 		frameNum:,
	 *		frameRate:,
 	 *		frameData: []
	 * }
	 */

	var AnimSprite = RectSprite.extend({
		_checkImgs: function () {
			this.supr();
			if (this.backgroundImageReady && this.animConfig) {
				this._dealAnimConfig();
			}
		},
		_dealAnimConfig: function () {
			this.animationLength = this.animConfig.frameNum/this.animConfig.frameRate;
		}
	});

}, {
	requires: ['./rectsprite']
})