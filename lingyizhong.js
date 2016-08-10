//wrap高度等于window高度
    $('.wrap').height($(window).innerHeight());
//横屏监听
	$(window).on('orientationchange',function(){
		if(window.orientation!=0){
			$('body').hide();
			alert('请使用竖屏观看！')
		}else{
			$('body').show();
		}
	})
//拼图游戏
    function Puzzle(selector,row,col){
        this.container = $(selector);
        this.width = this.container.width();
        this.height = this.container.height();
        this.row = row||2;
        this.col = col||2;
        this.chipW = this.width/col;
        this.chipH = this.height/row;
        this.chipNum = row*col;
        this.chipArr = [];
        this.orderArr =[];
        this.newOrderArr =[];
        this.pos = [];
        this.touchBol = true;
        this.moveBol = false;
        this.endBol = false;
        this.createChip();
    }
    Puzzle.prototype.createChip=function(){
        var frag = document.createDocumentFragment();
        for(var i=0;i<this.chipNum;i++){
            var chip = document.createElement('div');
            chip.style.cssText='width:'+this.chipW+'px;height:'+this.chipH+'px;background:url(img/bg.jpg) -'+i%this.col*this.chipW+'px -'+Math.floor(i/this.col)*this.chipH+'px no-repeat;position:absolute;';
            $(frag).append(chip);
            this.chipArr.push(chip);
            this.orderArr.push(i);
            this.newOrderArr.push(i);
        }
        this.container.append(frag);
        this.setPos();
        this.addEvent();
    }
    Puzzle.prototype.setPos=function(){
        this.newOrderArr.sort(function(){
            return Math.random() > 0.5 ? 1 :-1;
        })
        for(var i=0;i<this.chipArr.length;i++){
            this.pos[i]=[];
            this.pos[i][0]= i%this.col*this.chipW;
            this.pos[i][1]= Math.floor(i/this.col)*this.chipH;
        }
        for(var i=0;i<this.chipArr.length;i++){
        	//把DOM中的碎片按照newOrderArr的顺序排列
            $(this.chipArr[this.newOrderArr[i]]).css({
                left: this.pos[i][0],
                top: this.pos[i][1]
            })
        }
    }
    Puzzle.prototype.addEvent=function(){
        var thisPuzzle = this;
        var downX,downY,x,y,moveX=0,moveY=0,disX=0,disY=0;
        $('.container>div').on('touchstart',function(ev){
            ev.preventDefault();
            if(thisPuzzle.touchBol){
                downX = ev.originalEvent.changedTouches[0].clientX;
                downY = ev.originalEvent.changedTouches[0].clientY;
                x = downX - $(this).position().left;
                y = downY - $(this).position().top;
                thisPuzzle.moveBol = true;
	        }
        })
        $('.container>div').on('touchmove',function(ev){
            if(thisPuzzle.moveBol){
                thisPuzzle.touchBol = false;
                thisPuzzle.endBol = true;
                moveX = ev.originalEvent.changedTouches[0].clientX;
                moveY = ev.originalEvent.changedTouches[0].clientY;
                $(this).css({
                    left: moveX-x,
                    top: moveY-y,
                    zIndex:98
                })
             //溢出判断
                var thisPos = $(this).position();
               	if(thisPos.top>710){
               		disY = 710+y-downY;
               	}else if(thisPos.top<-100){
               		disY = -100+y-downY;
               	}else{
               		disY = moveY-downY;
               	}
               	if(thisPos.left<-70){
               		 disX = -70+x-downX;
               	}else if(thisPos.left>550){
               		 disX = 550+x-downX;
               	}else{
               		 disX = moveX-downX;
               	}
            }
        })
        $('.container>div').on('touchend',function(ev){
        		if(thisPuzzle.endBol){
        			thisPuzzle.touchBol = false;
        			thisPuzzle.moveBol = false;
        			thisPuzzle.endBol = false;
            		thisPuzzle.judgeNearest($(this),disX,disY);
        		}
        })
    }
    Puzzle.prototype.judgeNearest=function(chip,disX,disY){
        //获取当前碎片在newOrderArr的位置
        var currentChipIndex = this.newOrderArr.indexOf(chip.index());
        //获取交换碎片在newOrderArr的位置
        var nearestChipIndex = currentChipIndex + Math.round(disX/this.chipW) + Math.round(disY/this.chipH)*this.col;
        this.transposition(currentChipIndex,nearestChipIndex);
    }
    Puzzle.prototype.transposition=function(cIndex,nIndex){
        var thisPuzzle = this;
        //交换position
        var cChip = $('.container>div').eq(thisPuzzle.newOrderArr[cIndex]);
        var nChip = $('.container>div').eq(thisPuzzle.newOrderArr[nIndex]);
        cChip.animate({
            left: thisPuzzle.pos[nIndex][0],
            top: thisPuzzle.pos[nIndex][1]
        },500,function(){
            cChip.css('zIndex',0)
        })
        nChip.css('zIndex',97).animate({
            left: thisPuzzle.pos[cIndex][0],
            top: thisPuzzle.pos[cIndex][1]
        },500,function(){
            //交换碎片在newOrderArr的位置
            var transIndex = thisPuzzle.newOrderArr[cIndex];
            thisPuzzle.newOrderArr[cIndex] = thisPuzzle.newOrderArr[nIndex];
            thisPuzzle.newOrderArr[nIndex] = transIndex;
            console.log(thisPuzzle.newOrderArr);
            nChip.css('zIndex',0);
            thisPuzzle.finish();
        })
    }
    Puzzle.prototype.finish=function(){
        for(var i=0;i<this.orderArr.length;i++){
            if(this.newOrderArr[i] != this.orderArr[i]){
                	this.touchBol = true;
                return;
            }
            if(i==this.orderArr.length-1){
                $('.container').css('background','url(img/bg.jpg)');
                $('.container>div').fadeOut(500,function(){
                    $('.page8').css('background','url(img/l9_2.jpg)');
                    $('.container').fadeOut(300);
                    $('.redPoint').show();
                });
            }
        }
    }