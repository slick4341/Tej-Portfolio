
(function($) {

  $.fn.extend({
    slimScroll: function(options) {

      var defaults = {

        
        width : 'auto',

        
        height : '250px',

        
        size : '7px',

        
        color: '#000',

        
        position : 'right',

        
        distance : '1px',

        
        start : 'top',

        
        opacity : .4,

        
        alwaysVisible : false,

        
        disableFadeOut : false,

        
        railVisible : false,

        
        railColor : '#333',

        
        railOpacity : .2,

        
        railDraggable : true,

        
        railClass : 'slimScrollRail',

        
        barClass : 'slimScrollBar',

        
        wrapperClass : 'slimScrollDiv',

        
        allowPageScroll : false,

        
        wheelStep : 20,

        
        touchScrollStep : 200,

        
        borderRadius: '7px',

        
        railBorderRadius : '7px'
      };

      var o = $.extend(defaults, options);

      
      this.each(function(){

      var isOverPanel, isOverBar, isDragg, queueHide, touchDif,
        barHeight, percentScroll, lastScroll,
        divS = '<div></div>',
        minBarHeight = 30,
        releaseScroll = false;

        
        var me = $(this);

        
        if (me.parent().hasClass(o.wrapperClass))
        {
            
            var offset = me.scrollTop();

            
            bar = me.siblings('.' + o.barClass);
            rail = me.siblings('.' + o.railClass);

            getBarHeight();

            
            if ($.isPlainObject(options))
            {
              
              if ( 'height' in options && options.height == 'auto' ) {
                me.parent().css('height', 'auto');
                me.css('height', 'auto');
                var height = me.parent().parent().height();
                me.parent().css('height', height);
                me.css('height', height);
              } else if ('height' in options) {
                var h = options.height;
                me.parent().css('height', h);
                me.css('height', h);
              }

              if ('scrollTo' in options)
              {
                
                offset = parseInt(o.scrollTo);
              }
              else if ('scrollBy' in options)
              {
                
                offset += parseInt(o.scrollBy);
              }
              else if ('destroy' in options)
              {
                
                bar.remove();
                rail.remove();
                me.unwrap();
                return;
              }

              
              scrollContent(offset, false, true);
            }

            return;
        }
        else if ($.isPlainObject(options))
        {
            if ('destroy' in options)
            {
            	return;
            }
        }

        
        o.height = (o.height == 'auto') ? me.parent().height() : o.height;

        
        var wrapper = $(divS)
          .addClass(o.wrapperClass)
          .css({
            position: 'relative',
            overflow: 'hidden',
            width: o.width,
            height: o.height
          });

        
        me.css({
          overflow: 'hidden',
          width: o.width,
          height: o.height
        });

        
        var rail = $(divS)
          .addClass(o.railClass)
          .css({
            width: o.size,
            height: '100%',
            position: 'absolute',
            top: 0,
            display: (o.alwaysVisible && o.railVisible) ? 'block' : 'none',
            'border-radius': o.railBorderRadius,
            background: o.railColor,
            opacity: o.railOpacity,
            zIndex: 90
          });

        
        var bar = $(divS)
          .addClass(o.barClass)
          .css({
            background: o.color,
            width: o.size,
            position: 'absolute',
            top: 0,
            opacity: o.opacity,
            display: o.alwaysVisible ? 'block' : 'none',
            'border-radius' : o.borderRadius,
            BorderRadius: o.borderRadius,
            MozBorderRadius: o.borderRadius,
            WebkitBorderRadius: o.borderRadius,
            zIndex: 99
          });

        
        var posCss = (o.position == 'right') ? { right: o.distance } : { left: o.distance };
        rail.css(posCss);
        bar.css(posCss);

        
        me.wrap(wrapper);

        
        me.parent().append(bar);
        me.parent().append(rail);

        
        if (o.railDraggable){
          bar.bind("mousedown", function(e) {
            var $doc = $(document);
            isDragg = true;
            t = parseFloat(bar.css('top'));
            pageY = e.pageY;

            $doc.bind("mousemove.slimscroll", function(e){
              currTop = t + e.pageY - pageY;
              bar.css('top', currTop);
              scrollContent(0, bar.position().top, false);
            });

            $doc.bind("mouseup.slimscroll", function(e) {
              isDragg = false;hideBar();
              $doc.unbind('.slimscroll');
            });
            return false;
          }).bind("selectstart.slimscroll", function(e){
            e.stopPropagation();
            e.preventDefault();
            return false;
          });
        }

        
        rail.hover(function(){
          showBar();
        }, function(){
          hideBar();
        });

        
        bar.hover(function(){
          isOverBar = true;
        }, function(){
          isOverBar = false;
        });

        
        me.hover(function(){
          isOverPanel = true;
          showBar();
          hideBar();
        }, function(){
          isOverPanel = false;
          hideBar();
        });

        
        me.bind('touchstart', function(e,b){
          if (e.originalEvent.touches.length)
          {
            
            touchDif = e.originalEvent.touches[0].pageY;
          }
        });

        me.bind('touchmove', function(e){
          
          if(!releaseScroll)
          {
  		      e.originalEvent.preventDefault();
		      }
          if (e.originalEvent.touches.length)
          {
            
            var diff = (touchDif - e.originalEvent.touches[0].pageY) / o.touchScrollStep;
            
            scrollContent(diff, true);
            touchDif = e.originalEvent.touches[0].pageY;
          }
        });

        
        getBarHeight();

        
        if (o.start === 'bottom')
        {
          
          bar.css({ top: me.outerHeight() - bar.outerHeight() });
          scrollContent(0, true);
        }
        else if (o.start !== 'top')
        {
          
          scrollContent($(o.start).position().top, null, true);

          
          if (!o.alwaysVisible) { bar.hide(); }
        }

        
        attachWheel(this);

        function _onWheel(e)
        {
          
          if (!isOverPanel) { return; }

          var e = e || window.event;

          var delta = 0;
          if (e.wheelDelta) { delta = -e.wheelDelta/120; }
          if (e.detail) { delta = e.detail / 3; }

          var target = e.target || e.srcTarget || e.srcElement;
          if ($(target).closest('.' + o.wrapperClass).is(me.parent())) {
            
            scrollContent(delta, true);
          }

          
          if (e.preventDefault && !releaseScroll) { e.preventDefault(); }
          if (!releaseScroll) { e.returnValue = false; }
        }

        function scrollContent(y, isWheel, isJump)
        {
          releaseScroll = false;
          var delta = y;
          var maxTop = me.outerHeight() - bar.outerHeight();

          if (isWheel)
          {
            
            delta = parseInt(bar.css('top')) + y * parseInt(o.wheelStep) / 100 * bar.outerHeight();

            
            delta = Math.min(Math.max(delta, 0), maxTop);

            
            
            
            
            delta = (y > 0) ? Math.ceil(delta) : Math.floor(delta);

            
            bar.css({ top: delta + 'px' });
          }

          
          percentScroll = parseInt(bar.css('top')) / (me.outerHeight() - bar.outerHeight());
          delta = percentScroll * (me[0].scrollHeight - me.outerHeight());

          if (isJump)
          {
            delta = y;
            var offsetTop = delta / me[0].scrollHeight * me.outerHeight();
            offsetTop = Math.min(Math.max(offsetTop, 0), maxTop);
            bar.css({ top: offsetTop + 'px' });
          }

          
          me.scrollTop(delta);

          
          me.trigger('slimscrolling', ~~delta);

          
          showBar();

          
          hideBar();
        }

        function attachWheel(target)
        {
          if (window.addEventListener)
          {
            target.addEventListener('DOMMouseScroll', _onWheel, false );
            target.addEventListener('mousewheel', _onWheel, false );
          }
          else
          {
            document.attachEvent("onmousewheel", _onWheel)
          }
        }

        function getBarHeight()
        {
          
          barHeight = Math.max((me.outerHeight() / me[0].scrollHeight) * me.outerHeight(), minBarHeight);
          bar.css({ height: barHeight + 'px' });

          
          var display = barHeight == me.outerHeight() ? 'none' : 'block';
          bar.css({ display: display });
        }

        function showBar()
        {
          
          getBarHeight();
          clearTimeout(queueHide);

          
          if (percentScroll == ~~percentScroll)
          {
            
            releaseScroll = o.allowPageScroll;

            
            if (lastScroll != percentScroll)
            {
                var msg = (~~percentScroll == 0) ? 'top' : 'bottom';
                me.trigger('slimscroll', msg);
            }
          }
          else
          {
            releaseScroll = false;
          }
          lastScroll = percentScroll;

          
          if(barHeight >= me.outerHeight()) {
            
            releaseScroll = true;
            return;
          }
          bar.stop(true,true).fadeIn('fast');
          if (o.railVisible) { rail.stop(true,true).fadeIn('fast'); }
        }

        function hideBar()
        {
          
          if (!o.alwaysVisible)
          {
            queueHide = setTimeout(function(){
              if (!(o.disableFadeOut && isOverPanel) && !isOverBar && !isDragg)
              {
                bar.fadeOut('slow');
                rail.fadeOut('slow');
              }
            }, 1000);
          }
        }

      });

      
      return this;
    }
  });

  $.fn.extend({
    slimscroll: $.fn.slimScroll
  });

})(jQuery);
