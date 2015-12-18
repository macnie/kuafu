/**
 * jQuery插件 展示类似淘宝的那种多城市选择
 * @author macnie<http://www.macnie.com>
 * @param {type} $
 * @returns {Function|window.$.fn.areapanel|$.fn.areapanel|jquery_areapanel_L4.$.fn.areapanel}
 */
(function($) {
  // 插件的定义
  return $.fn.areapanel = function(options,callback) {
  	// 插件的defaults
	  $.fn.areapanel.defaults = {
            target:0,
            valuation:0,
            other_entity:[],
            input:'',
            entity:[],
        }
        var opts = $.extend({}, $.fn.areapanel.defaults, options);
        var t = $(this);
        var areapanel = $('<div class="areapanel"></div>');
        var region_mask = create();
        var china = create_china();
        areapanel.append(china).append(region_mask);
        var btn = $('<a>确定选择</a>').addClass('btn btn-primary btn-md').bind('click',function(){
            var data  =  package_data();
            callback.call(this,data);
            unmask();
        })
        mask({size:'lg',header:'选择城市',body:areapanel,footer:btn});
        //预处理目前存在的数据
        prepear_data();
        //注册事件
        areapanel.find('input[type=checkbox]').on('click',{},checkbox_click);
        /**
         * 负责把选中的城市结果集进行封装
         * @returns [city_ids:array,city_names:string]
         */
        function package_data(){
            var data = {city_ids:package_city_ids(),city_names:package_city_names()};
            return data;
        }
        function package_city_ids(){
            var city_ids = [];
            $.each($(".areapanel-cities-input:checked"),function(i){
                city_ids.push($(this).val())
            })
            return city_ids;
        }
        function package_city_names(){
            var names = [];
            if($("#area-1").is(':checked')){
                names.push('全国');
            }else{
               $.each($(".areapanel-provinces"),function(i){
                   if($(this).is(':checked')){
                       names.push($(this).data('name'));
                   }else{
                       var cities = $(this).parent().next().find('.areapanel-cities-input:checked');
                       $.each(cities,function(){
                           names.push($(this).data('name'));
                       })
                   }
                })
            }
            return implode(',',names);
        }
        //预处理数据
        function prepear_data(){
            if(opts.other_entity.length>0){
                for(var i in opts.other_entity){
                    $("#area-"+opts.other_entity[i]).attr('disabled',true)
                }
            }
            if(opts.entity.length > 0){
                for(var i in opts.entity){
                    $("#area-"+opts.entity[i]).prop('checked',true)
                }
            }
            refresh_status()
        }
        //创建面板主体内容
        function create(){
            var ul = $('<ul class="list-unstyled"></ul>').addClass('areapanel-list');
            $.each(AreaPart.group,function(i){
                    var toggle_class = i%2?'even':'odd';
                    var li = $('<li></li>').addClass('clearfix').addClass(toggle_class);
                    var area = create_areas(this,i);
                    li.append(area);
                    // 创建每个省的列表主题
                    var provinces_div = create_pros(this.codes);
                    li.append(provinces_div);
                    ul.append(li);
            })

            return ul;
        }
        //创建全国的单选
        function create_china(){
            var div = $('<div></div>').attr('class','clearfix');
            var label = $('<label>').html('全国').attr('for','area-'+1);
            var input = $('<input type="checkbox">').attr('value',1).attr('id','area-'+1).attr('area-type',1);//create_input(area.title,area.codes,area.id);
            return div.append(input).append(label);
        }
        //创建每行的头部地区
        function create_areas(area,i){
            var div = $('<div></div>').attr('class','ecity gcity');
            var label = $('<label>').html(area.title).attr('for','area-'+i);
            var input = $('<input type="checkbox">').attr('value',implode(',',area.codes)).attr('id','area-part-'+i).attr('area-type',0).attr('class','areapanel-area');//create_input(area.title,area.codes,area.id);
            return div.append(input).append(label);
        }
        //创建地区下的省份列表
        function create_pros(provinces){
        	//创建列表
            var province_list = $('<div></div>').attr('class','province-list');
            $.each(provinces,function(i){
                var ecity = $('<div></div>').attr('class','ecity');
                var province = get_area(this);
                //开始构造省份的DOM
                var gareas = $('<span></span>').attr('class','gareas');
                var province_input = $('<input type="checkbox">').data('name',province.name).attr('value',province.id).attr('area-type',2).attr('id','area-'+province.id).attr('class','areapanel-provinces');//create_input(province.name,province.id,'province'+province.id);

                var label = $('<label></label>').attr('for','area-'+province.id).html(province.name);
                //创建结果集
                var checked_cities_num = '<span class="check-num"></span>';
                //创建下拉图标
                var cities_arrow = $('<i class="glyphicon glyphicon-chevron-down"></i>');
                //注册监听事件
                cities_arrow.on('click',{action:'open'},toggle_cities);
                gareas.append(province_input).append(label).append(checked_cities_num).append(cities_arrow);
                ecity.append(gareas);
                //创建城市列表
                var cities_wrapper = create_cities(province.id);
                ecity.append(cities_wrapper);
                province_list.append(ecity);
            })
            return province_list;
        }
        //获取区域
        function get_area(id){
            for(var i in Area){
                if(Area[i].id == id){
                    return Area[i];
                }
            }
            return false;
        }
        //创建城市
        function create_cities(province_id){
            var div = $('<div></div>').attr('class','areapanel-cities');
            for(var i in Area){
                if(Area[i].parent_id == province_id){
                    var city = Area[i];
                    var input = $('<input type="checkbox">').attr('value',city.id).attr('class','areapanel-cities-input').attr('area-type',3).attr('id','area-'+city.id).data('name',city.name);
                    var label = $('<label></label>').attr('for','area-'+city.id).html(city.name);
                    var span = $('<span></span>').append(input).append(label);
                    div.append(span);
                }
            }
            var close_cities = $('<input type="button" value="关闭" class="areapanel-cities-close">');
            close_cities.on('click',{action:'close'},toggle_cities)
            div.append(close_cities)
            return div;
        }
        //处理省份下拉菜单
        function toggle_cities(params){
            var action = params.data.action;
            if(action == 'open'){
                $(this).parents('.ecity').addClass('show-city-pop');
            }else{
                $(this).parents('.ecity').removeClass('show-city-pop');
            }
        }
        //处理所有checkbox click事件
        function checkbox_click(params){
            var type = $(this).attr('area-type');
            if(type < 3){
                var childs = $(this).parent().next().find('input[type=checkbox]');
                if($(this).is(':checked')){
                    childs.prop('checked',true);
                }else{
                    childs.removeProp('checked');
                }
            }
            refresh_status();
        }
        function refresh_status(){
            $('.areapanel-cities').each(function(){
                var cities_wrapper = $(this);
                var total = $(cities_wrapper).find('input[type=checkbox]').size();
                var count = $(cities_wrapper).find('input[type=checkbox]:checked').size();
                var disabled = $(cities_wrapper).find('input[type=checkbox]:disabled').size();
                if(total !==  count){
                    $(cities_wrapper).prev().children('input[type=checkbox]').removeProp('checked');
                }else{
                    $(cities_wrapper).prev().children('input[type=checkbox]').prop('checked',true);
                }
                if(total !==  disabled){
                    $(cities_wrapper).prev().children('input[type=checkbox]').removeProp('disabled');
                }else{
                    $(cities_wrapper).prev().children('input[type=checkbox]').prop('disabled',true);
                }
                if(count === 0){
                    count = '';
                }
                $(cities_wrapper).prev().children('.check-num').html(count);
            })
            $(".areapanel-list li").each(function(){
                var total = $(this).find('.areapanel-provinces').size();
                var count = $(this).find('.areapanel-provinces:checked').size();
                var disabled = $(this).find('.areapanel-provinces:disabled').size();
                if(total !==  count){
                    $(this).children('.ecity').children('input[type=checkbox]').removeProp('checked');
                }else{
                    $(this).children('.ecity').children('input[type=checkbox]').prop('checked',true);
                }
                if(total !==  disabled){
                    $(this).children('.ecity').children('input[type=checkbox]').removeProp('disabled');
                }else{
                    $(this).children('.ecity').children('input[type=checkbox]').prop('disabled',true);
                }
            })
            var total = 8;
            var count = $(".areapanel-area:checked").size();
            var disabled = $(".areapanel-area:disabled").size();
            if(total !==  count){
                $('#area-1').removeProp('checked');
            }else{
                $('#area-1').prop('checked',true);
            }
            if(total !==  disabled){
                $('#area-1').removeProp('disabled');
            }else{
                $('#area-1').prop('disabled',true);
            }

        }
        function mask (params){
            var options = {
                header:'提示',
                body:'',
                size:'md',
            };
            var params = $.extend({},options,params);
            try{
                if(!document.getElementById('my-modal')){
                    $("body").append('<div id="my-modal" class="modal  fade"><div class="modal-dialog modal-'+params.size+'"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 id="mask-header" class="modal-title"></h4></div><div id="mask-body" class="modal-body"></div><div id="mask-footer" class="modal-footer"></div></div></div></div>');
                }
                $("#mask-header").html(params.header);
                $("#mask-body").html(params.body);
                $("#mask-footer").html(params.footer);
                $("#my-modal").modal({backdrop:'static',show:true});
            }catch(e){
                error(e.message);
            }
        }
        function unmask(){
            $("#my-modal").modal('hide');
        }
        function implode(glue, pieces) {
          var i = '',
            retVal = '',
            tGlue = '';
          if (arguments.length === 1) {
            pieces = glue;
            glue = '';
          }
          if (typeof pieces === 'object') {
            if (Object.prototype.toString.call(pieces) === '[object Array]') {
              return pieces.join(glue);
            }
            for (i in pieces) {
              retVal += tGlue + pieces[i];
              tGlue = glue;
            }
            return retVal;
          }
          return pieces;
        }
    }
})(jQuery);
