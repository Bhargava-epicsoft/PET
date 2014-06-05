var rulesArr = [];
var xmlStore;
var colors;
var sensitivty = 15;

//$("#content",parent.document).append("<table id='xmlTable' border='1'><tr></tr></table>");
var column_pattern = [];
var pdfContent = [];
var pdfText = "";
var current_div_selected;
var manual = false;
var app_state = "";
var current_offset = 0;

$( document ).ready(function() {

    $.getJSON("../../../data/scales_json.txt",function(result){
      rulesArr = result;
    });
   
    $('.setAble').click(function(){
        $('.setAble').removeClass('setButton')
        $(this).addClass('setButton');
    });

    $('#addTags').click(function(){
        
        manual = true;

        if (pdfContent.length < 1)
        {
            pdfContent = getPDFContent();

            pdfText = "";

            $.each(pdfContent, function(index,value) { var string = $(value).text().replace(/\s{2,}/g, ' '); pdfText = pdfText + " " + $.trim(string); });
        }

        $('#state').val("add");
    });

    $('#removeTags').click(function(){
        $('#state').val("remove");
    });

});

function mousemove_pdf()
{
    selectedText = cleanupText(getSelectedText());
        if (selectedText) 
        {
            if(selectedText.split(' ').length < 20)
            {
                //alert('heh');
                //parent.setCurrentText(selectedText);
            }
        }
}

function deleteSpan(span_id)
{
    if($('#state', parent.document).val()=="remove")
    {
        var span = $('.id' + span_id);
        $.each(span, function()
        {
            var span_text = $(this).text();
            $(this).replaceWith(span_text);
        });
    }
}

function highlightSelectedText(selectedText)
{
    var pattern_list = [];
    pattern_list.push(selectedText.toString());
    ringBufferHighlight(pattern_list, current_div_selected);
}

function setCurrentText(selectedText)
{
    $('#current_text').val(selectedText);
}

function autoTag()
{

    manual = false;
    app_state = "autoTag";

    extractPDFData();


    pattern_list = [];

    /*$.getJSON("../../data/scales_json.txt",function(result){
      rulesArr = result;
    });
*/
   
    
    $.each(rulesArr, function()
    {
        if(this)
        {
        if(this.scale && typeof(this.scale)!="undefined" && findPattern(this.scale, pdfText))
        pattern_list.push(this.scale);

        if(this.abbrev && typeof(this.abbrev)!="undefined" && findPattern("\s" + this.abbrev + "\s", pdfText))
        pattern_list.push(" " + this.abbrev + " ");
        }
    });



    //pattern_list.push("maintenance treatment with antipsychotic medication is complicated by tardive dyskinesia");

    //hehe = pattern_list;

    //alert()

    ringBufferHighlight(pattern_list);



}

function safePattern(text)
{
    new_text = text;


    new_text = new_text.replace(/\'/, "\\'");
    new_text = new_text.replace(/\)/, "\\)");
    new_text = new_text.replace(/\(/, "\\(");

    //new_text = encodeURIComponent(new_text);
        


    return new_text;
}

function extractPDFData()
{
    if (pdfContent.length < 1)
    {
        pdfContent = getPDFContent();

        pdfText = "";

        $.each(pdfContent, function(index,value) { var string = $(value).text().replace(/\s{2,}/g, ' '); pdfText = pdfText + " " + $.trim(string); });
    }
}

function ringBufferHighlight(pattern_list, start_div)
{


    if (pdfContent.length < 1)
    {
        pdfContent = getPDFContent();

        pdfText = "";

        $.each(pdfContent, function(index,value) { var string = $(value).text().replace(/\s{2,}/g, ' '); pdfText = pdfText + " " + $.trim(string); });
    }

    var i = 0;
    var len = pdfContent.length;
    var textarea = "";

    if(ringBufferHighlight.length>1)
    {
        for(var j = 0; j < pdfContent.length; j++)
        {
            if($(start_div).text() == $(pdfContent[j]).text())
            {
                i = j;
                len = i + 6; 
            }
        }
    }

    var pattern_highlighted = false;

    while(i < len)
    {
        var arr;
        var textarea;
        if(i + 5 < len)
        {
            arr = pdfContent.slice(i,i+5);
        }
        else
        {
            var c = i + (len - i - 1);
            arr = pdfContent.slice(i,c);
        }

        $.each(arr, function(index,value) { var string = $(value).text().replace(/\s{2,}/g, ' '); textarea = textarea + " " + $.trim(string); });

        //findPattern('Maintenance treatment with antipsychotic medication is complicated by tardive dyskinesia', textarea.replace(/-\s/g, ''));
        //test_text = "Maintenance treatment with antipsychotic medication is complicated by tardive dyskinesia";

        textarea = cleanupText(textarea);


        $.each(pattern_list, function(index,value)
        {   
            if(findPattern(value,textarea) && !pattern_highlighted)
            {
                highlightDivs(value,arr);
                if(start_div)
                {
                    pattern_highlighted = true;
                    var categs = prompt("Please enter categories","");
                    if(categs.length>0){add_to_tags(categs);}
                    //break;

                }
            }
        });

        textarea = "";

        i+=1;

    }




}

function highlightDivs(pattern, div_sec)
{
    var total_div_length = 0;

    $.each(div_sec, function(index,value)
    {
        total_div_length += cleanupText($(value).text()).split(' ').length;
    });

//    alert('highlighting');


    var text = pattern.split(' ');
    var div_pairs = [];
    var current_div_val = 0;
    var current_div_word = 0;
    var current_pattern_word = 0;
    var pattern_ready = false;
    var error_count = 0;

    if(findPattern(text[0], $(div_sec[0]).text()) && total_div_length >= text.length)
    {

        //alert('in');
        //alert(cleanupText($(div_sec[current_div_val]).text()));

        var current_div = cleanupText($(div_sec[current_div_val]).text()).split(' ');
        var current_div_lower = cleanupText($(div_sec[current_div_val]).text().toLowerCase()).split(' ');
        var current_div_word = current_div_lower.indexOf(text[0].toLowerCase());
        var current_pattern_word = 0;

        var partial_word = false;

        if(current_div_word < 0)
        {
            var counter_k = 0;
            while(counter_k < current_div_lower.length && !current_div_lower[counter_k].match(text[0].toLowerCase()))
            {

                //alert(current_div_lower[counter_k] + " ---- " + text[0].toLowerCase());
                //alert(!findPattern(current_div_lower[counter_k],text[0].toLowerCase()));
                counter_k++;
            }
            current_div_word = counter_k;
            partial_word = true;
        }

        var word_pair = [];
        word_pair.push(current_div[current_div_word]);

/*
        alert(current_div);
        //alert(current_div[current_div_word] + "===" + text[current_pattern_word]);
        var partial_word = false;

        if(current_div_word < 0)
        {
            var counter_k = 0;
            while(counter_k < current_div_lower.length && !current_div_lower[counter_k].match(text[0].toLowerCase()))
            {

                alert(current_div_lower[counter_k] + " ---- " + text[0].toLowerCase());
                //alert(!findPattern(current_div_lower[counter_k],text[0].toLowerCase()));
                counter_k++;
            }
            current_div_word = counter_k;
            partial_word = true;
        }
        */

        //alert(current_div[1]);

        //alert(current_div_word);
        //alert(current_div[current_div_word] + "===" + text[current_pattern_word]);

        while(current_div[current_div_word] && text[current_pattern_word] && ((current_div[current_div_word].toLowerCase() === text[current_pattern_word].toLowerCase()) || partial_word || (current_pattern_word == text.length - 1)) && error_count < 1000)
        //while(findPattern(text[current_pattern_word],current_div[current_div_word]))
        {
            //alert('woop');
            partial_word = false;
           // alert(current_div[current_div_word] + "===" + text[current_pattern_word]);
            current_div_word++;
            current_pattern_word++;

            if(current_pattern_word >= text.length)
            {
                word_pair.push(current_div[current_div_word-1]);
                //word_pair.push(text[current_pattern_word-1]);
                div_pairs.push(word_pair);
                //alert(word_pair.toString());
                pattern_ready = true;
                //alert(div_pairs.toString());

            }
            else if(current_div_word >= current_div.length)
            {
                //alert('here');
                word_pair.push(current_div[current_div_word-1]);
                //word_pair.push(text[current_pattern_word-1]);
                div_pairs.push(word_pair);
                current_div_val++;

                if(current_div_val >= div_sec.length)
                {
                    return;
                }
                else
                {
                   // alert('1');
                    current_div = cleanupText($(div_sec[current_div_val]).text()).split(' ');
                    current_div_word = 0;
                    word_pair = [];
                    word_pair.push(current_div[current_div_word]);
                    //alert(word_pair.toString());
                    //word_pair.push(text[current_pattern_word]);
                }

            }

            error_count ++;

             //alert('2');

        }

        if(pattern_ready)
        {
            var d = new Date();
            var n = d.getTime();

            current_class = n;

            for(var i = 0; i < div_pairs.length; i++)
            {
                inner_html = $(div_sec[i]).html().replace(div_pairs[i][0],'<span class="highlight id'+n+'" onmouseover=highlightTag("'+n+'") onmouseout=r_highlightTag("'+n+'") onclick=deleteSpan("'+n+'")>'+div_pairs[i][0]).replace(div_pairs[i][1],div_pairs[i][1]+'</span>');
                $(div_sec[i]).html(inner_html);

            }

            if(app_state === "autoTag" && $('#state').val() != "add")
            {
                addAnnotation(pattern, n);
            }

        }

    }

    wordpairs = div_pairs;

}

function highlightTag(tagID)
{
    $.each($('.' + tagID, parent.document), function() {
        $(this).addClass('tag_selected');

    });
}

function r_highlightTag(tagID)
{
    $.each($('.' + tagID, parent.document), function() {
        $(this).removeClass('tag_selected');

    });
}

// add tagged data to XML list
function add_to_tags(tags)
{
    var tag_array = tags.split("-");

    var list = $('#content', parent.document);

    $.each(tag_array, function(){

        var tag_name = $.trim(this);
        //alert(tag_name);
        new_list_item = list.find('#'+tag_name);

        if(new_list_item.length)
        {
            new_list_item.addClass('' + current_class + '');
            list = new_list_item;
        }
        else
        {
            var html = ""
            html += "<li id='"+tag_name+"' class='"+current_class+"'>";
            html += "<div>"+tag_name+"<button id='"+tag_name+"_button' class='show_table' onclick=switch_table('"+tag_name+"')>+</button></div>";
            html += "<ol></ol>";

            html += "<table class='stats_table' id='"+tag_name+"_table'></table>";

            html += "</li>";

            var list_elem = list.find('ol');
            list_elem.first().append(html);
            list = list_elem.find('#'+tag_name);
        }
    });

}

function cleanupText(text)
{
    var new_text = $.trim(text);

    new_text = new_text.replace(/\s{2,}/g, ' ');
    new_text = new_text.replace(/-\s/g, ' ');

    return new_text
}

function findPattern(pattern, text)
{

    try
    {
  
        pat = new RegExp(safePattern(pattern), 'gi');

    //alert(text);

        if(text.match(pat))
        {
            //alert(text);
            //alert('"' + pattern + '" : found');
            return true;
        }
        else
        {
            return false;
            //alert('"' + pattern +'" : not found');
        }
    }
    catch(err)
    {
        alert(safePattern(pattern));
    }

}




function getPDFContent()
{

pdf = $("#iFrame").contents().find("#viewer");

pageMax = $("#iFrame").contents().find('#pageNumber').prop('max');

pageDivs = [];

for(var i = 1; i < pageMax + 1; i++)
{
    //pageDivs.append($('#pageContainer1 > .textLayer', pdf));    
    pageDivs.push($('#pageContainer'+i+' > .textLayer', pdf));
    //pageDivs = $('.page > .textLayer', pdf);
}


pDivs = $('div', $(pageDivs));

$.each(pageDivs, function(index,value) { pageDivs[index] = orderDivs(value); });

//pageDivs = orderDivs(pageDivs[0]);

var divs = _.flatten(pageDivs);

return divs;

}

function orderDivs(divArray)
{
    var ordered_page = [];

    var sep_divs = $('div', divArray);

    $.each(sep_divs, function(index,value)
    {
        var count = ordered_page.length;
        var val = $(value);

        val.mousedown(function( event ) {current_div_selected = $(value);});

        if(orderDivs.length < 1)
        {
            orderDivs.push(val);
        }
        else
        { 
            ordered_page.push(val);
            
            var divpos = $(ordered_page[count]).position();
            var vpos = $(ordered_page[count-1]).position();

            while(count > 0 && vpos.top >= divpos.top )
            {
                
                divpos = $(ordered_page[count]).position();
                vpos = $(ordered_page[count-1]).position();
                
                var store = ordered_page[count-1];
                
                
                if((vpos.left > divpos.left && vpos.top == divpos.top) || vpos.top > divpos.top)
                {
                    ordered_page[count-1] = ordered_page[count];
                    ordered_page[count] = store;
                }
                else
                {
                    count = 0;
                }
        

                count--;
            }
            
        }


    });

    return columnPattern(ordered_page);

}

function columnPattern(ordered_divs)
{
    var columns = [];
    var column_count =[];
    var is_column = [];
    var column_size = [];
    var final_columns = [];
    var new_ordered_divs = [];


    $.each(ordered_divs, function (index,value)
    {
        var div_pos = $(value).position().left;
        var div_size = $(value).width();
       // alert(div_size);
        var added_to_count = false;

        //alert(div_pos + " " + added_to_count);

        $.each(columns, function(index,value)
        {
            if(value - sensitivty <= div_pos && div_pos <= value + sensitivty && !added_to_count)
            {
                var total = parseInt(column_size[index]) * column_count[index];
                column_count[index] += 1;

                //alert((total + div_size) / column_count[index]);

                //column_size[index] = (total + div_size) / column_count[index];
                column_size[index] = Math.floor((total + div_size)/parseInt(column_count[index]));
                //alert(total);
                added_to_count = true;
            }
        });

        if(!added_to_count)
        {
            //alert('new column ' + div_pos);
            columns.push(div_pos);
            column_count.push(1);
            column_size.push(div_size);
        }

    });


    $.each(columns, function (index,value)
    {
        var gap = 0;

        if(index < columns.length - 1)
        {
            gap = columns[index+1] - (columns[index] + column_size[index]);
        }
        
        if(gap>=0)
        {
            is_column.push(true);
            final_columns.push(columns[index]);
        }
        else
        {
            is_column.push(false);
        }


    });

    new_ordered_divs = ordered_divs;

    $.each(final_columns, function (index,value)
    {
        new_ordered_divs = groupColumns(value, new_ordered_divs);
    });

    return new_ordered_divs;

}

function groupColumns(group, array)
{
    var found_index = 0;
    var found_first = false;
    var grouped_arr = array;
    var store = [];

    for(var i = (grouped_arr.length - 1); i >= 0; i--)
    {
        var div_pos = $(grouped_arr[i]).position().left;

        if(group - sensitivty <= div_pos && div_pos <= group + sensitivty)
        {
            store.push(grouped_arr[i]);
            grouped_arr = removeAt(grouped_arr, i);
            found_index = i;
        }
    }

    store = store.reverse();

    grouped_arr = insertArrayAt(grouped_arr, found_index, store);

    return grouped_arr; 
}

function insertAt(array, index) {
    var arrayToInsert = Array.prototype.splice.apply(arguments, [2]);
    return insertArrayAt(array, index, arrayToInsert);
}

function insertArrayAt(array, index, arrayToInsert) {
    Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
    return array;
}

function removeAt(arr, idx)
{
    var array = [];

    $.each(arr, function(index,value)
    {
        if(index!=idx)
        {
            array.push(value);
        }
    }
    );

    return array;
}

function getRules()
{

    alert('getRules');

    var data = {}
    
    if(rulesArr==null)
    {

        //alert('hehe');
     
    $.ajax({
            url: '/getRules',
            type: 'GET',
            data: data,
            dataType: 'json',
            success: function(data){

            received = JSON.parse(JSON.stringify(data));                              
            var rules = received;  
            var length = rules.length;
            rulesArr = rules;

            autoTag();

            },
             error: function(xhr, textStatus, errorThrown){
                alert('request failed');
                $("#error").html(xhr.responseText);
            }
       });
    
    }

}


function getSelectedText() {

    var text = "";
    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString();
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    return text;


}

function addAnnotation(annotation, tagClass)
{
    //alert(tagClass);
    var data={"annotation":annotation, "class" : tagClass };
        
        $.ajax({
            
            url: '/addAnnotation',
            type: 'POST',
            data: data,
            dataType: 'html',
            success: function(data){

                xmlDoc=loadXMLString(data.toString());

                //* * * * * * needs to be changed to correct outside tags!! * * * * * \\
                var x=xmlDoc.getElementsByTagName("PDF")[0];

                //alert(x);

                var html = newParseXML(x);

                //removeDuplicateClasses();

                $('#tagBox', parent.document).html("");
                $('#tagBox', parent.document).append(html);

                removeDuplicateClasses();

               
            }
        });
}

function removeDuplicateClasses()
{
    var lists = $('#content').find('li');

    $.each(lists, function()
    {
        var classes = $(this).attr('class');
        $(this).attr('class', '');
        $(this).addClass(filterClasses(classes));

    });
    
}

function filterClasses(original_classes)
{
    var  arr = original_classes.split("\s");

    arr = arr.filter( function( item, index, inputArray ) {
           return inputArray.indexOf(item) == index;
    });

    var new_classes = "";

    $.each(arr, function()
    {
        new_classes = new_classes + " " + this;
    });

    return new_classes;
}

function endSelect()
{

    if($('#state', parent.document).val() == "add")
    {
    selectedText = cleanupText(getSelectedText());
    if (selectedText) 
    {
        if(selectedText.split(' ').length < 20)
        {
            app_state = "tagging";
            parent.highlightSelectedText(selectedText);
        }
    }
    }   

}


function loadXMLString(txt) 
{
    if (window.DOMParser)
    {
      parser=new DOMParser();
      xmlDoc=parser.parseFromString(txt,"text/xml");
    }
    else // code for IE
    {
      xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async=false;
      xmlDoc.loadXML(txt); 
    }
    return xmlDoc;
}

function parseXML(x, format, col_count)
{
   
    var color = colors[col_count];

    for(var i = 0; i < (x.childNodes.length); i++)
    {

        var child_tag = x.childNodes[i].tagName;
        if(!child_tag)
        {
            child_tag = x.childNodes[i].nodeValue;
        }
        


        $('#xmlTable tr:last', parent.document).after("<tr id='ar'><td>" + format.replace("%s",child_tag) + "</tr></td>");
        
        if(x.childNodes[i].hasChildNodes())
        {
            var child_nodes = x.getElementsByTagName(child_tag)[0];
            //var new_format = format.replace("%s","<div style='background-color:"+color+"' class='inner'>%s</div>");
            var new_format = format.replace("id='inner'", "");
            new_format = new_format.replace("background-color", "");
            new_format = new_format.replace("%s","<div id='inner' style='background-color:"+color+"' class='inner'>%s</div>");
            parseXML(child_nodes, new_format, col_count+1);
        }


}

}

function newParseXML(x)
{
    var html = "";

    for(var i = 0; i < (x.childNodes.length); i++)
    {
        child_tag_class = "";


        var child_tag = x.childNodes[i].tagName;
        if(!child_tag)
        {
            child_tag = x.childNodes[i].nodeValue;
            child_tag_class = x.childNodes[i].getAttribute('class');
        }
        
        child_tag_class = x.childNodes[i].getAttribute('class');

        html += "<li id='"+child_tag+"' class='"+child_tag_class+"'>";
        html += "<div>"+child_tag+"<button id='"+child_tag+"_button' class='show_table' onclick=switch_table('"+child_tag+"')>+</button></div>";
        
        html += "<ol>";
        if(x.childNodes[i].hasChildNodes())
        {
            var child_nodes = x.getElementsByTagName(child_tag)[0];
            html += newParseXML(child_nodes);
        }
        html += "</ol>";

        html += "<table class='stats_table' id='"+child_tag+"_table'></table>";

        html += "</li>";

    }

    return html;

}

function switch_table(name)
{
    var list = $('#'+name);
    var button = $('#'+name+'_button');
    var table = $('#'+name+'_table');
    var html = "";

    if(table.html() === html)
    {
        //uniqueTags(list);
        var classList = uniqueTags(list).attr('class').split(/\s+/);
        //uniqueTags(list);
        $.each( classList , function(index, item){
        if (item !== 'ui-sortable' && item !== 'ui-sortable-helper' && item.length > 0) 
        {
            html += "<tr class='"+item+"' onclick=findHighlightedTag('"+item+"')><td>"+getSpanText(item)+"</td></tr>"
        }
        else if(item.length == 0)
        {
            html += "<tr class='no_content'><td>no tags</td></tr>"
        }
        });
        table.html(html);
        button.text("-");
    }
    else
    {
        //alert('2');
        table.html(html);
        button.text("+");
    }
}


function uniqueTags(listObj)
{
    var new_listObj = $(listObj).clone();

    var child_list = $(new_listObj).find('li');

    var classes = "";

    $.each(child_list, function()
    {
        classes += " " + ($(this).attr('class'));
    });

    $.each(classes.split(/\s+/), function()
    {
        if($.trim(this).length>0)
        $(new_listObj).removeClass($.trim(this));
    });

    return new_listObj;
}


function getSpanText(class_name)
{
    var text = "";
    var span = $("#iFrame").contents().find('.id'+class_name);
    $.each( span, function(index, item){
    
       text += $(item).text() + " ";
    
    });

    return text;
}

function findHighlightedTag(class_name)
{

    $("#iFrame").contents().find('span').attr('style','');    

    var span = $("#iFrame").contents().find('.id'+class_name);
    $.each( span, function(index, item){
    
       $(item).css('background','rgba(242, 5, 5, 0.48)');
    
    });

//    $("#iFrame").scrollTo(span[0]);
 //   .animate({scrollTop:0}, 'slow');
        //$('#iFrame').animate({scrollTop:0}, 'slow');



    var $contents = $('#iFrame').contents().find('#viewerContainer');
    $contents.animate({ scrollTop: -1 }, 0);
    current_offset = $(span).offset().top;
    $contents.animate({ scrollTop: current_offset - 250 }, 1000);

    //alert( current_offset );

    //$contents.scrollTop($contents.height());
    
}



