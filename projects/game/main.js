require.config({
	baseUrl: "../../src/",
    urlArgs: "v=" + (new Date()).getTime()
});

Global = {
	totalWater: 2000,
	currentWater: 2000,
	scale: 1,
	width: 640,
	height: 960,
	WATEROFFSET: 400,
	score: 100
};

$(document).on('touchstart', function(e) {
	e.preventDefault();
});

$(document).on('touchmove', function(e) {
	e.preventDefault();
});

require(['Timer', 'Layer', 'element/Rect', '../projects/game/pen', '../projects/game/cm', '../projects/game/block', '../projects/game/xiguan'], 
function(timer, Layer, Rect, Pen, CM, Block, XiGuan) {
	var   b2Vec2 = Box2D.Common.Math.b2Vec2
		, b2AABB = Box2D.Collision.b2AABB
		, b2BodyDef = Box2D.Dynamics.b2BodyDef
		, b2Body = Box2D.Dynamics.b2Body
		, b2FixtureDef = Box2D.Dynamics.b2FixtureDef
		, b2Fixture = Box2D.Dynamics.b2Fixture
		, b2World = Box2D.Dynamics.b2World
		, b2MassData = Box2D.Collision.Shapes.b2MassData
		, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
		, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
		, b2DebugDraw = Box2D.Dynamics.b2DebugDraw
		, b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
		, b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

	var W = Global.width * Global.scale;
	var H = Global.height * Global.scale;
	var xiguan, layer, X = (document.documentElement.clientWidth - Global.width) / 2 + 'px',
		Y = Math.max((document.documentElement.clientHeight - H) / 2, 0) + 'px';

	var bottomTop = 783;

	Global.setTotalWater = function(water) {
		this.currentWater = Math.max(water, 0);
		xiguan.setLength(this.currentWater);
	};

	Global.start = function(mock) {
		mock && mock.remove();

		var bg = new Rect().setSize(Global.width, Global.height).setFill('images/background.png').setScale(Global.scale);

		layer.appendChild(bg);

		var rope = new Rect().setSize(640, 80).setFill('images/rope.png').setPosition(0, 34).setAnchor(0, 0);

		layer.appendChild(rope);

		var bottom = new Rect().setSize(640, 177).setFill('images/buttom.png').setPosition(0, 960).setAnchor(0, 1);
		
		layer.appendChild(bottom);

		$(layer.canvas).css({
			'border': "3px solid rgba(0, 0, 0, .5)",
			'left': X,
			'top': Y,
			'position': 'ablsolute'
		});

		var scoreDom = $('<div style="z-index: 3;position:absolute;height:40px;width:125px;left:' + (parseInt(X) + 500)  + 'px;' +
			'top:' + (parseInt(Y) + 20) + 'px;' +
			'">' +
			'<span style="display: inline-block;width: 30px; height: 100%;" id="score0"></span>' +
			'<span style="display: inline-block;width: 30px; height: 100%;" id="score1"></span>' +
			'<span style="display: inline-block;width: 30px; height: 100%;" id="score2"></span>' +
			'<span style="display: inline-block;width: 30px; height: 100%;" id="score3"></span>' +
		'</div>');

		$('body').append(scoreDom);

		Global.setScore(Global.score);
		
		//设置世界范围
		var world = new b2World(new b2Vec2(0, 300), true);

		// var toy = new Toy(world, layer);

		var block = new Block(world, layer);

		Global.pen = new Pen(layer);

		var cm = new CM(world, layer);


		xiguan = new XiGuan(layer);


		var leftBlock = new b2BodyDef;
		leftBlock.type = b2Body.b2_staticBody;
		var centerBlock = new b2BodyDef;
		centerBlock.type = b2Body.b2_staticBody;
		var rightBlock = new b2BodyDef;
		rightBlock.type = b2Body.b2_staticBody;
		
		var leftBlockFix = new b2FixtureDef();
		leftBlockFix.density = 1.0;
		leftBlockFix.restitution = .5;
		leftBlockFix.friction = 0.5;

		var centerBlockFix = new b2FixtureDef();
		centerBlockFix.density = 1.0;
		centerBlockFix.restitution = .5;
		centerBlockFix.friction = 0.5;

		var rightBlockFix = new b2FixtureDef();
		rightBlockFix.density = 1.0;
		rightBlockFix.restitution = .5;
		rightBlockFix.friction = 0.5;

		var leftShape = new b2PolygonShape;
		var centerShape = new b2PolygonShape;
		var rightShape = new b2PolygonShape;

		leftBlockFix.shape = leftShape;
		leftBlockFix.shape.SetAsArray([
			new b2Vec2(0 , 17 + bottomTop),
			new b2Vec2(32, 27 + bottomTop),
			new b2Vec2(83 , 177 + bottomTop),
			new b2Vec2(0, 177 + bottomTop)
		]);

		centerBlockFix.shape = centerShape;
		centerBlockFix.shape.SetAsArray([
			new b2Vec2(300,36 + bottomTop),
			new b2Vec2(363,56 + bottomTop),
			new b2Vec2(387,177 + bottomTop),
			new b2Vec2(249,177 + bottomTop)
		]);

		rightBlockFix.shape = rightShape;
		rightBlockFix.shape.SetAsArray([
			new b2Vec2(614,45 + bottomTop),
			new b2Vec2(640,36 + bottomTop),
			new b2Vec2(640,177 + bottomTop),
			new b2Vec2(585,177 + bottomTop)
		]);

		var leftBody = world.CreateBody(leftBlock);
		leftBody.CreateFixture(leftBlockFix);
		var centerBody = world.CreateBody(centerBlock);
		centerBody.CreateFixture(centerBlockFix);
		var rightBody = world.CreateBody(rightBlock);
		rightBody.CreateFixture(rightBlockFix);

		timer.register(function() {
			world.Step(1 / 36, 10, 10);
			world.ClearForces();
		});

		timer.active();
	};

	Global.setScore = function(score) {
		$('#score0').css('background', 'url(images/digits/' + parseInt(score / 1000) + '.png)');
		$('#score1').css('background', 'url(images/digits/' + parseInt(score % 1000 / 100) + '.png)');
		$('#score2').css('background', 'url(images/digits/' + parseInt(score % 100 / 10) + '.png)');
		$('#score3').css('background', 'url(images/digits/' + parseInt(score % 10) + '.png)');
	};

	Global.showEntry = function(callback) {
		var entryParent = $('<div></div>');
		entryParent.css({
			'left': X,
			'top': Y,
			'position': 'absolute',
			'height': Global.height,
			'width': Global.width,
			// '-webkit-transform': 'scale(' + Global.scale + ')',
			'z-index': 1,
			'background': 'url(images/background.png) no-repeat 0 bottom'
		});
		var entryHTML = [
			'<div style="width: 640px; left: 0px; height: 500px; position:absolute; top: 50px;background: url(images/title.png) no-repeat 0 0;"></div>',
			'<div id="tip-play" style="-webkit-transform: all .5s ease-out; width: 220px; left: 190px; height: 130px; position:absolute; bottom: 300px;background: url(images/play.png) no-repeat 0 0;"></div>',
			'<div id="tip-help" style="-webkit-transform: all .5s ease-out;width: 260px; left: 190px; height: 130px; position:absolute; bottom: 200px;background: url(images/help.png) no-repeat 0 0;"></div>',
			'<div id="tip-credit" style="-webkit-transform: all .5s ease-out;width: 290px; left: 190px; height: 130px; position:absolute; bottom: 100px;background: url(images/credit.png) no-repeat 0 0;"></div>'
		].join('');
		entryParent.html(entryHTML);

		$('body').append(entryParent);

		$('#tip-play').on('mousedown', function() {
			callback && callback(entryParent);
		});
		$('#tip-help').on('mousedown', function() {
			Global.showTip('help', entryParent, Global.showEntry);
		});
		$('#tip-credit').on('mousedown', function() {
			Global.showTip('credit', entryParent, Global.showEntry);
		});
		$('#tip-play').on('touchstart', function() {
			callback && callback(entryParent);
		});
		$('#tip-help').on('touchstart', function() {
			Global.showTip('help', entryParent, Global.showEntry);
		});
		$('#tip-credit').on('touchstart', function() {
			Global.showTip('credit', entryParent, Global.showEntry);
		});
	};

	Global.showTip = function(type, mock, callback) {
		mock && mock.remove();
		var entryParent = $('<div></div>');
		entryParent.css({
			'left': X,
			'top': Y,
			'position': 'absolute',
			'height': Global.height,
			'width': Global.width,
			// '-webkit-transform': 'scale(' + Global.scale + ')',
			'z-index': 1,
			'background': 'url(images/background.png) no-repeat 0 bottom'
		});
		var entryHTML = [
			'<div style="width: 100%; height: 100%; background: url(images/' + 
				(type == 'credit' ? 'names' : 'bangzhu')
				+'.png) no-repeat center center;"></div>'
		].join('');

		entryParent.html(entryHTML);

		$('body').append(entryParent);

		entryParent.on('mousedown', function() {
			entryParent.remove();
			callback && callback(Global.start);
		});
		entryParent.on('touchstart', function() {
			entryParent.remove();
			callback && callback(Global.start);
		});
	};

	$(function() {
		layer = new Layer(document.body, {
			width: W,
			height: H,
			left: 0,
			top: 0
		});

		// Global.start();
		if(window.applicationCache) {
			var __loadingDom = null;
			window.applicationCache.addEventListener('downloading', function() {
				var entryParent = $('<div></div>');
				__loadingDom = entryParent;
				entryParent.css({
					'left': X,
					'top': Y,
					'position': 'absolute',
					'height': Global.height,
					'width': Global.width,
					// '-webkit-transform': 'scale(' + Global.scale + ')',
					'z-index': 1,
					'background': 'url(images/background.png) no-repeat 0 bottom'
				});
				var entryHTML = [
					'<div style="width: 100%; height: 100%; background: url(images/loading/loading.png) no-repeat center center;' +
					'-webkit-animation-name: loading;',
    				'-webkit-animation-duration: .5s;',
					'-webkit-animation-iteration-count: infinite;',
    				'-webkit-animation-timing-function: linear;',
					'"></div>'
				].join('');

				entryParent.html(entryHTML);

				$('body').append(entryParent);
			});

			window.applicationCache.addEventListener('cached', function() {
				__loadingDom && __loadingDom.remove();
				Global.showEntry(Global.start);
			});

			window.applicationCache.addEventListener('updateready', function() {
				__loadingDom && __loadingDom.remove();
				Global.showEntry(Global.start);
			});

			window.applicationCache.addEventListener('noupdate', function() {
				Global.showEntry(Global.start);
			});

			window.applicationCache.addEventListener('obsolete', function() {
				Global.showEntry(Global.start);
			});

			window.applicationCache.addEventListener('error', function() {
				Global.showEntry(Global.start);
			});
		}
		
		
		

		return;




		
		// var gradientFill = new Fill();
		
		// gradientFill.render = function(context, element) {
		// 	var grad = context.createLinearGradient(-15, -15, 15, 15);
		// 	grad.addColorStop(0, 'rgba(255,0,0,1)');
		// 	grad.addColorStop(1, 'rgba(0,255,0,1)');
		// 	context.fillStyle = grad;
		// };
		
		// var circle = new Circle().setSize(30, 30).setAnchor(.5, .5);
		// var circle1 = new Circle().setFill(gradientFill).setSize(30, 30).setAnchor(.5, .5);
		
		// layer.appendChild(circle);   
		// layer.appendChild(circle1);
		
		
		// var cbodyDef = new b2BodyDef();
		// cbodyDef.position.Set(200, 100);
		// cbodyDef.angularDamping = .001;

		// var circleShape = new b2CircleShape();
		// circleShape.radius = 15;

		// var circleFix = new b2FixtureDef;
		// circleFix.density = 1;
		// circleFix.restitution =.8;
		// circleFix.friction = 1;
		// circleFix.shape = circleShape;
		
		// var cbodyDef1 = new b2BodyDef();
		// cbodyDef1.position.Set(400, 100);
		// cbodyDef1.angularDamping = .001;


		// var circleDef1 = new Box2D.Collision.Shapes.b2CircleShape();
		// circleDef1.radius = 15;
		
		// var circleFix1 = new b2FixtureDef;
		// circleFix1.density = 1;
		// circleFix1.restitution =.8;
		// circleFix1.friction = 1;
		// circleFix1.shape = circleDef1;
		
		// var cicleBody = world.CreateBody(cbodyDef);
		// cicleBody.CreateFixture(circleFix);
		// var cicleBody1 = world.CreateBody(cbodyDef1);
		// cicleBody1.CreateFixture(circleFix1);

		// var ground = new b2BodyDef;

		// var groundFix = new b2FixtureDef();
		// groundFix.restitution = .9
		// groundFix.density = 0;
		// groundFix.friction = 1;

		// var groundShape = new b2PolygonShape;
		// groundFix.shape = groundShape;
		// // groundFix.shape.SetAsVector([[-100,-10],[100,-10],[100,10],[-100,10]]); 
		// groundFix.shape.SetAsBox(1, 1);
		

		// var ground1 = new b2BodyDef;
		
		// var groundFix1 = new b2FixtureDef();
		// groundFix1.restitution = .9
		// groundFix1.density = 0;
		// groundFix1.friction = 1;

		// var groundShape1 = new b2PolygonShape;
		// // groundShape1.SetAsVector([[100,-10],[300,-36],[300,10],[300,10]]);
		// groundShape1.SetAsBox(1, 1); 

		// groundFix1.shape = groundShape1;



		// var groundBody = world.CreateBody(ground);
		// groundBody.CreateFixture(groundFix);
		// var groundBody1 = world.CreateBody(ground1);
		// groundBody1.CreateFixture(groundFix1);
		
		// var box = new Rect().setFill('rgba(100,0,0)').setSize(200, 20).setAnchor(.5, .5);
		// var box1 = new Polygon().setFill('rgba(100,0,0)').setPoints(
		// 	[{
		// 		x: -100,
		// 		y: -10
		// 	},
		// 	{
		// 		x: 100,
		// 		y: -36
		// 	},
		// 	{
		// 		x: 100,
		// 		y: 10
		// 	},
		// 	{
		// 		x: -100,
		// 		y: 10
		// 	}]
		// );
		// layer.appendChild(box);
		// layer.appendChild(box1);
		
		// var time = 0;
		// timer.register(function() {
		// 	world.Step((new Date().valueOf() - time) / 1000, 3);
		// 	time = new Date().valueOf();
		// 	var pos = cicleBody.GetPosition();
		// 	var pos1 = cicleBody1.GetPosition();
		// 	var rot = cicleBody1.GetAngle();
		// 	circle.setPosition(pos);
		// 	circle1.setPosition(pos1);
		// 	circle1.setRotation(-rot/Math.PI*180);
		// 	var pos = groundBody.GetPosition();
		// 	box.setPosition(pos);
		// 	box1.setPosition({
		// 		x: pos.x + 200,
		// 		y: pos.y
		// 	});
		// });
		
		// time = new Date().valueOf();
		// timer.active();
	});
});
