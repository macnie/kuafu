 /********
  * @name 最普通的三个选择框并列省市县选择器
  * @param {type} $
  * @returns {undefined}
  */
 (function($) {
  $.fn.region = function(options) {
	  $.fn.region.defaults = {
	    target: 'city_id',
	  };
    var opts = $.extend({}, $.fn.region.defaults, options);
    var THIS;
    return this.each(function() {
      THIS = $(this);
      var parent_id = 1;
      load_data(THIS.find('select:first'),parent_id);
    });
    function load_data(select,parent_id){
        var index = select.index()+2;
        var current = select.data('current');
        var options = get_options(select,parent_id)
        var empty = get_empty(index);
        options = empty+options;
        select.html(options);
        var next_select = select.next();
        select.bind('change',function(){
            var val = $(this).val();
            if($(this).index() < 2){
                load_data(next_select,val);
            }
        });alert(index);
        if(index>1 && index <4){
            load_data(next_select,current);
        }

    }
    function get_options(select,parent_id){
        var current = select.data('current');
        var options = '';
        if(parent_id >0){
            $.each(Area,function(i){
                if(this.parent_id == parent_id){
                    // 是当前的数据
                    var selected = '';
                    if(current === this.id){
                        selected = 'selected';
                    }
                    options += '<option '+selected+' value="'+this.id+'">'+this.name+'</option>';
                }
            })
        }
        return options;
    }
    function get_empty(type){
        switch(type){
            case 2:
                return '<option value="">请选择省份</option>';
                break;
            case 3:
                return '<option value="">请选择城市</option>';
                break;
            case 4:
                return '<option value="">请选择区县</option>';
                break;
        }
    }
  };
// 闭包结束
})(jQuery);
