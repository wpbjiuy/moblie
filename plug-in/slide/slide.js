var Slide = (function(){
	var Slide = function(opt){
		this.dom = opt.dom;
		this.isAuto = true;									//是否自动滑动
		this.intervalTime = opt.intervalTime || 5000;		//自动滑动间隔时间
		this.slideTime = opt.slideTime || 400;				//滑动所需时间
		this.mx = opt.mx || 100;							//移动多少距离进行滑动
		this.qUl = opt.qUl || '.slide-ul';
		this.qLi = opt.qLi || '.slide-li';
	}

	Slide.prototype.run = function() { 
		this.init();
	};

	Slide.prototype.slide = function(touchObj, tox, isy){ 
		var self = this;
		if(tox){
			var time = self.slideTime - Math.abs(touchObj.mx / touchObj.lw * self.slideTime);
			if(time < 100) time = 100;
			if(isy){
				self.uls.animate({left:tox}, time)
			}else{
				touchObj.mx > 0 ? self.slidePrev(time) : self.slideNext(time);
			}
		}else{
			self.uls.css('left', touchObj.lf + touchObj.mx + 'px');
		}
	}

	Slide.prototype.slidePrev = function(time){
		var self = this;
		self.uls.animate({left:'0px'}, time || self.slideTime, function(){
			self.addPrev();
			self.uls.css('left', self.ileft+'px');
		});
	}

	Slide.prototype.slideNext = function(time){
		var self = this;
		self.uls.animate({left: self.ileft * 2 + 'px'}, time || self.slideTime, function(){
			self.addNext();
			self.uls.css('left', self.ileft+'px');
		});
	}

	Slide.prototype.bindEvent = function(){
		var self = this;
		var touchObj = {
			lf:0,
			lw:0,
			dx:0,
			mx:0
		}
		self.dom.on('mousedown.slide touchstart.slide', function(e){ 
			clearInterval(self.setInterval);
			self.uls.stop(true, true);
			touchObj.dx = e.pageX || e.originalEvent.touches[0].pageX;
			touchObj.lf = parseFloat(self.uls.css('left'));
			touchObj.lw = parseInt(self.lis.width());
			self.dom.on('mousemove.slide touchmove.slide', function(e){
				self.move(e, touchObj)
			})
			self.isTouchThis = true;
		});

		$(window).on('mouseup.slide touchend.slide', function(e){ 
			if(!self.isTouchThis) return;

			self.dom.off('mousemove.slide touchmove.slide');

			var n = Math.round(touchObj.lf/touchObj.lw);

			if(Math.abs(touchObj.mx) > self.mx){
				var lf = -(touchObj.mx > 0 ? n + 1 : n - 1) * self.ileft + 'px';
				self.slide(touchObj, lf);
			}else{
				self.slide(touchObj, self.ileft + 'px', true);
			}

			self.slideAuto();

			self.isTouchThis = false;
		})

		$(window).on('resize.slide', function(){
			self.ileft = -self.dom.width();
			self.uls.css('left', self.ileft+'px');
			self.lis.width(-self.ileft+'px');
		})

		self.lis.on('dragstart', function(){
			return false;
		})
	}

	Slide.prototype.move = function (e, touchObj){
		var x = e.pageX || e.originalEvent.touches[0].pageX;

		touchObj.mx = x - touchObj.dx;

		this.slide(touchObj);
	}

	Slide.prototype.init = function(){
		this.uls = this.dom.find(this.qUl);

		if(this.uls.find(this.qLi).length <= 1) return;

		this.uls.prepend(this.uls.find(this.qLi+':last').clone(true));

		this.lis = this.uls.find(this.qLi);

		this.ileft = -this.dom.width();
		this.lis.width(-this.ileft+'px');

		this.uls.css({
			'width': 100 * this.lis.length + '%',
			'left': this.ileft+'px'
		});

		this.bindEvent();

		if(this.isAuto) this.slideAuto();
	}

	Slide.prototype.slideAuto = function() { 
		var self = this;
		self.setInterval = setInterval(function(){
			self.slideNext()
		},self.intervalTime)
	};

	Slide.prototype.addPrev = function(){ 
		this.uls.prepend(this.lis.eq(this.lis.length-2).clone(true));
		this.lis.eq(this.lis.length-1).remove();
		this.lis = this.uls.find(this.qLi);
	}

	Slide.prototype.addNext = function(){
		this.uls.append(this.lis.eq(1).clone(true));
		this.lis.eq(0).remove();
		this.lis = this.uls.find(this.qLi);
	}

	return Slide;
})()