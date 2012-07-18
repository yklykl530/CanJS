/**
 * @author stefan
 * @fileOverview 图像填充类（支持切片）
 */
goog.provide('Stefan.fill.ImageFill');

goog.require('Stefan');
goog.require('Stefan.Updater');
goog.require('Stefan.fill.Fill');

/**
 * 图像填充类
 * @constructor
 * @augments Stefan.fill.Fill
 */
Stefan.fill.ImageFill = T.lang.createClass(function(url) {
		Stefan.fill.Fill.call(this);
		this.__url = url;
		this.__image = Stefan.images[url];
		this.__loaded = false;
		if(!this.__image) {
			this.__image = new Image();
			this.__image.src = url;
			var __this = this;
			T.on(this.__image, 'load', function() {
				Stefan.images[url] = __this.__image;
				if(__this.element && __this.element.getStage()) Stefan.Updater.register(__this.element.getStage());
				//内存中有了就会先于render执行，所以要重置标志位
				__this.__loaded = true;
			})
		}
		else
			this.__loaded = true;
		this.__clip = null;
}, {
	superClass: Stefan.fill.Fill
}).extend({
	isLoaded: function() {
		return this.__image && this.__image.width && this.__image.height;
	},
	
	/**
	 * 设置切片参数
	 * @param {number} x 切片横坐标
	 * @param {number} y 切片纵坐标
	 * @param {number} x 切片宽度
	 * @param {number} x 切片高度
	 * @returns {Stefan.fill.ImageFill} 图片填充实例本身
	 */
	setClip: function(x, y, width, height) {
		this.__clip = {
			x: parseInt(x),
			y: parseInt(y),
			width: parseInt(width),
			height: parseInt(height)
		};
		
		//更新
		if(this.element && this.element.getStage()) Stefan.Updater.register(this.element.getStage());
		return this;
	},
	
	/**
	 * 获得切片参数
	 * @returns {object} 切片参数
	 */
	getClip: function() {
		return this.__clip;
	},
	
	render: function(context, element) {
		if(!this.__loaded) return;
   		var size = element.getSize();
   		var bounds = element.getSelfBounds();
	    if (!size.width || !size.height) return;
	    
        context.save();
        context.translate(bounds.left, bounds.top);
        
        if(this.__clip == null){
        	var aspx = size.width/this.__image.width, aspy = size.height/this.__image.height;
	        var patten = context.createPattern(this.__image, 'no-repeat');
	        context.scale(aspx, aspy);
	        context.fillStyle = patten;
	        context.fillRect(0, 0, this.__image.width, this.__image.height);
		}else{
			var aspx = size.width/this.__clip.width, aspy = size.height/this.__clip.height;
			context.scale(aspx, aspy);
		    context.drawImage(this.__image, this.__clip.x, this.__clip.y, this.__clip.width, 
		    	this.__clip.height, 0, 0, size.width, size.height);
		}
        context.restore();
	}
})