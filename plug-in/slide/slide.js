var Slide = (function(){
	var Slide = function(opt){
		this.dom = opt.dom;
		this.type = opt.type || 'distanceSlide';			//滑动类型：timeSlide => 滑动时间滑动，distanceSlide => 滑动距离
		this.isAuto = true;									//是否自动滑动
		this.intervalTime = opt.intervalTime || 5000;		//自动滑动间隔时间
		this.slideTime = opt.slideTime || 400;				//滑动所需时间
		this.mx = opt.mx || 200;							//移动多少距离进行滑动
		this.stm = opt.stm || 320;							//移动多少毫毛内进行滑动
		this.qUl = opt.qUl || '.slide-ul';
		this.qLi = opt.qLi || '.slide-li';
	}

	Slide.prototype.run = function() { 
		this.init();
		return this;
	};

	Slide.prototype.slide = function(touchObj, isMove){ 
		var self = this;
		if(!isMove){ 
			var time = (self.ileft - Math.abs(touchObj.mx)) / self.ileft * this.slideTime;
			if(time < 200) time = 200;
			touchObj.mx > 0 ? self.slidePrev(time) : self.slideNext(time);
		}else{
			self.uls.css('left', -self.ileft + touchObj.mx + 'px');
		}

		return self;
	}

	Slide.prototype.tmSlide = function(touchObj) {
		var time = Date.now() - touchObj.tm;

		if(time < 200) time = 200;
		else if(time > this.slideTime) time = this.slideTime;

		touchObj.mx > 0 ? this.slidePrev(time) : this.slideNext(time);

		return this;
	};

	Slide.prototype.slidePrev = function(time){
		var self = this;
		self.uls.animate({left:'0px'}, time || self.slideTime, function(){
			self.addPrev();
			self.uls.css('left', -self.ileft+'px');
		});
	}

	Slide.prototype.slideNext = function(time){
		var self = this;
		self.uls.animate({left: -self.ileft * 2 + 'px'}, time || self.slideTime, function(){
			self.addNext();
			self.uls.css('left', -self.ileft+'px');
		});

		return self;
	}

	Slide.prototype.bindEvent = function(){
		var self = this;
		var touchObj = {
			dx:0,
			mx:0,
			tm:Date.now()
		}
		self.dom.on('touchstart.slide', function(e){ 
			clearInterval(self.setInterval);
			self.uls.stop(true, true);

			touchObj.mx = 0;
			touchObj.dx = e.pageX || e.originalEvent.touches[0].pageX;
			touchObj.tm = Date.now();

			self.dom.on('touchmove.slide', function(e){
				self.move(e, touchObj);
			})
			self.isTouchThis = true;

			self.bindTouchend(touchObj);
		});

		$(window).on('resize.slide', function(){
			self.ileft = self.dom.width();
			self.uls.css('left', -self.ileft+'px');
			self.lis.width(self.ileft+'px');
		})

		self.lis.on('dragstart', function(){
			return false;
		})

		return self;
	}

	Slide.prototype.bindTouchend = function(touchObj) {
		var self = this;
		
		$(window).on('touchend.slide', function(e){ 
			if(!self.isTouchThis) return;

			self.dom.off('touchmove.slide');
			
			if(self.type == 'timeSlide'){
				if(touchObj.mx && (Date.now() - touchObj.tm < self.stm || Math.abs(touchObj.mx) > self.ileft/2)){
					self.tmSlide(touchObj);
				}else{
					self.uls.animate({'left': -self.ileft + 'px'}, 200);
				}
			}else{ 
				if(Math.abs(touchObj.mx) > self.mx){
					self.slide(touchObj);
				}else{ 
					self.uls.animate({'left': -self.ileft + 'px'}, 200);
				}
			}

			self.slideAuto();

			self.isTouchThis = false;

			$(window).off('touchend.slide');
		});

		return self;
	};

	Slide.prototype.move = function (e, touchObj){
		var x = e.pageX || e.originalEvent.touches[0].pageX;

		touchObj.mx = x - touchObj.dx;

		this.slide(touchObj, true);

		return this;
	}

	Slide.prototype.init = function(){
		this.uls = this.dom.find(this.qUl);

		if(this.uls.find(this.qLi).length <= 1) return;

		this.uls.prepend(this.uls.find(this.qLi+':last').clone(true));

		this.lis = this.uls.find(this.qLi);

		this.ileft = this.dom.width();
		this.lis.width(this.ileft+'px');

		this.uls.css({
			'width': 100 * this.lis.length + '%',
			'left': -this.ileft+'px'
		});

		this.bindEvent();

		if(this.isAuto) this.slideAuto();

		return this;
	}

	Slide.prototype.slideAuto = function() { 
		var self = this;
		self.setInterval = setInterval(function(){
			self.slideNext();
		},self.intervalTime);

		return self;
	};

	Slide.prototype.addPrev = function(){ 
		this.uls.prepend(this.lis.eq(this.lis.length-2).clone(true));
		this.lis.eq(this.lis.length-1).remove();
		this.lis = this.uls.find(this.qLi);

		return this;
	}

	Slide.prototype.addNext = function(){
		this.uls.append(this.lis.eq(1).clone(true));
		this.lis.eq(0).remove();
		this.lis = this.uls.find(this.qLi);

		return this;
	}

	return Slide;
})()