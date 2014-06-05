var rulesArr;
var xmlStore;
var colors;
var sensitivty = 15;

//$("#content",parent.document).append("<table id='xmlTable' border='1'><tr></tr></table>");
var column_pattern = [];
var pdfContent = [];
var pdfText = "";

/*
$(document).ready(function()
{
    alert('ready');
});
*/

function autoTag()
{

    pdfContent = getPDFContent();

    pdfText = "";

    $.each(pdfContent, function(index,value) { var string = $(value).text().replace(/\s{2,}/g, ' '); pdfText = pdfText + " " + $.trim(string); });

    //$('#content').append(pdfText);
    
    //findPattern('Maintenance treatment with antipsychotic medication is complicated by tardive dyskinesia', pdfText);
    //findPattern('A series of studies', pdfText);
    //findPattern('Maintenance treatment with antipsychotic medication is complicated by tardive dyskinesia', pdfText);
    

    var pattern_list = [];
    pattern_list.push("Maintenance treatment with antipsychotic medication is complicated by tardive dyskinesia");
    pattern_list.push("Patients can retain a small but significant amount of information with a low risk of noncompliance.");
    pattern_list.push("This paper evaluates the effects of an educational intervention");
    ringBufferHighlight(pattern_list);



}

function ringBufferHighlight(pattern_list)
{
    pdfContent = getPDFContent();

    pdfText = "";

    $.each(pdfContent, function(index,value) { var string = $(value).text().replace(/\s{2,}/g, ' '); pdfText = pdfText + " " + $.trim(string); });


    alert('ringBufferHighlight');

    if (pdfContent.length > 0) {alert('lol')}else{alert('no')};

    donk = pdfContent;

    var i = 0;
    var len = pdfContent.length;
    var textarea = "";


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

            if(findPattern(value,textarea))
            {
                highlightDivs(value,arr);
            }
        });

        /*
        if(findPattern(test_text,textarea))
        {
            highlightDivs(test_text,arr);
        }
        */

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

    //alert(total_div_length);


    var text = pattern.split(' ');
    var div_pairs = [];
    var current_div_val = 0;
    var current_div_word = 0;
    var current_pattern_word = 0;
    var pattern_ready = false;

    if(findPattern(text[0], $(div_sec[0]).text()) && total_div_length >= text.length)
    {


        var current_div = cleanupText($(div_sec[current_div_val]).text()).split(' ');
        var current_div_word = current_div.indexOf(text[0]);
        var current_pattern_word = 0;
        var word_pair = [];
        word_pair.push(current_div[current_div_word]);

        while(current_div[current_div_word] === text[current_pattern_word])
        {
            //alert('woop');
            //alert(current_div[current_div_word] + "===" + text[current_pattern_word]);
            current_div_word++;
            current_pattern_word++;

            if(current_pattern_word >= text.length)
            {
                word_pair.push(text[current_pattern_word-1]);
                div_pairs.push(word_pair);
                pattern_ready = true;
                //alert(div_pairs.toString());

            }
            else if(current_div_word >= current_div.length)
            {
                //alert('here');

                word_pair.push(text[current_pattern_word-1]);
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
                }

            }

             //alert('2');

        }

        if(pattern_ready)
        {

            for(var i = 0; i < div_pairs.length; i++)
            {
                //$(div_sec[i]).html(div_pairs[i].toString());
                inner_html = $(div_sec[i]).html().replace(div_pairs[i][0],'<span class="highlight">'+div_pairs[i][0]).replace(div_pairs[i][1],div_pairs[i][1]+'</span>');
                //inner_html = $(div_sec[i]).html().replace(div_pairs[i][1],div_pairs[i][1]+'<span>');
                $(div_sec[i]).html(inner_html);

            }
        }

    }



}

function cleanupText(text)
{
    var new_text = text;

    new_text = new_text.replace(/\s{2,}/g, ' ');
    new_text = new_text.replace(/-\s/g, ' ');

    return new_text
}

function findPattern(pattern, text)
{
    pat = new RegExp(pattern, 'gi');

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




function getPDFContent()
{

pdf = $("#iFrame").contents().find("#viewer");

pageDivs = $('.page > .textLayer', pdf);

pDivs = $('div', $(pageDivs));

//$.each(pageDivs, function(index,value) { pageDivs[index] = orderDivs(value); });

pageDivs = orderDivs(pageDivs[0]);

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
            //is_column.push(gap);

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



function extractText()
{

   alert('tagName');

	pageNumber = $("#iFrame").contents().find("#pageNumber");
    pdf = $("#iFrame").contents().find("#pageContainer" + pageNumber.val());

	var data = {}

    pdf.highlight("refusal to take", "i");

    
    if(rulesArr==null)
    {
     
	$.ajax({
            url: '/getRules',
            type: 'GET',
            data: data,
            dataType: 'json',
            success: function(data){

            var received = JSON.parse(JSON.stringify(data));                              
            var rules = received;  
            var length = rules.length;
            rulesArr = rules;
                        
            $.each(rules, function() 
                {
                    if(this.scale!=null)
                        {pdf.highlight(this.scale,"i");} 
                    if(this.abbrev!=null)
                        {pdf.highlight(this.abbrev,"");}
                });
            //alert("tagging complete");

            },
             error: function(xhr, textStatus, errorThrown){
       			alert('request failed');
       			$("#error").html(xhr.responseText);
    		}
       });
    
    }
    else
    {
        
        $.each(rulesArr, function() 
                {
                    if(this.scale!=null)
                        {pdf.highlight(this.scale,"i");} 
                    if(this.abbrev!=null)
                        {pdf.highlight(this.abbrev,"");}
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

function addAnnotation(annotation)
{
    var data={"annotation":annotation};
        
        $.ajax({
            
            url: '/addAnnotation',
            type: 'POST',
            data: data,
            dataType: 'html',
            success: function(data){

                xmlDoc=loadXMLString(data.toString());

                var x=xmlDoc.getElementsByTagName("PDF")[0];

                colors=new Array("#A45E72","#BF8E9C", "#D2B0BA", "#E9D8DD", "#BAADB1");
                
                $("#xmlTable", parent.document).remove();
                $("#tableBox",parent.document).append("<table id='xmlTable' border='0'><tr></tr></table>");
                parseXML(x,"<div id='inner' style='background-color:#7D1935;'>%s</div>", 0);
               
            }
        });
}

/*
function highlightSelectedText()
{

}

*/
function doSomethingWithSelectedText() {
    

    var selectedText = cleanupText(getSelectedText());
    if (selectedText) {
        
        alert(selectedText.split(' ').length);

        if(selectedText.split(' ').length < 20)
        {
            //alert(selectedText);
            var pattern_list = [];

            //pdfContent = getPDFContent();
            //pdfText = "";
            //$.each(pdfContent, function(index,value) { var string = $(value).text().replace(/\s{2,}/g, ' '); pdfText = pdfText + " " + $.trim(string); });


            pattern_list.push(selectedText);
            //ringBufferHighlight(pattern_list);

            //parent.ringBufferHighlight(pattern_list);
            $(self.window.opener.document).ringBufferHighlight(pattern_list);
        }
        else
        {
            alert('selection to long');
        }

        //addAnnotation(selectedText);

        //stylizeHighlightedString();
    


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
    //var new_colors = colors.splice(0, 1);
     


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

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}


function stylizeHighlightedString() 
{
    pageNumber = $("#pageNumber");
    pdf = $("#pageContainer" + pageNumber.val()); 

    var range               = window.getSelection().getRangeAt(0);
    var selectionContents   = range.extractContents();
    var span                = document.createElement("span");
    span.appendChild(selectionContents);
    span.setAttribute("class","uiWebviewHighlight");

    ///alert(selectionContents);

    span.style.backgroundColor  = "red";
    span.value = "1000";

    var d = new Date();
    var n = d.getTime();
    $("#spanID").val(n);
    span.id = n;
    span.style.color            = "white";
    span.setAttribute("onclick","deleteSpan('" + n + "')");
    span.title = selectionContents;

    range.insertNode(span);
    
}


jQuery.fn.highlight = function(pattern,modifs) {

	pdf = $("#iFrame").contents().find("#viewer");
    var regex = typeof(pattern) === "string" ? new RegExp(pattern, modifs) : pattern; // assume very LOOSELY pattern is regexp if not string
    //alert(regex.toString());
    function innerHighlight(node, pattern) {
        var skip = 0;
        if (node.nodeType === 3) { // 3 - Text node
            var pos = node.data.search(regex);
            if (pos >= 0 && node.data.length > 0) { // .* matching "" causes infinite loop
            	//pdf.highlight(pattern,modifs)
                var match = node.data.match(regex); // get the match(es), but we would only handle the 1st one, hence /g is not recommended
                haha = match;
                var spanNode = document.createElement('span');
                spanNode.className = 'highlight'; // set css
                spanNode.style.backgroundColor  = "red";
                spanNode.style.color            = "white";
                var middleBit = node.splitText(pos); // split to 2 nodes, node contains the pre-pos text, middleBit has the post-pos
                var endBit = middleBit.splitText(match[0].length); // similarly split middleBit to 2 nodes
                var middleClone = middleBit.cloneNode(true);

                addAnnotation(middleClone.nodeValue);
                //hehe = middleClone;


/*
                        spanNode.appendChild(selectionContents);
                        spanNode.setAttribute("class","uiWebviewHighlight");
                        spanNode.style.backgroundColor  = "red";
                        spanNode.style.color            = "white";
                        spanNode.setAttribute("onclick","deleteSpan('" + n + "')");
                        spanNode.title = selectionContents;
*/

                    spanNode.appendChild(middleClone);
                // parentNode ie. node, now has 3 nodes by 2 splitText()s, replace the middle with the highlighted spanNode:
                middleBit.parentNode.replaceChild(spanNode, middleBit); 
                skip = 1; // skip this middleBit, but still need to check endBit
            }
        } else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) { // 1 - Element node
            for (var i = 0; i < node.childNodes.length; i++) { // highlight all children
                i += innerHighlight(node.childNodes[i], pattern); // skip highlighted ones
            }
        }
        return skip;
    }
     
    return this.each(function() {
        innerHighlight(this, pattern);
    });
};
 
jQuery.fn.removeHighlight = function() {
    return this.find("span.highlight").each(function() {
        this.parentNode.firstChild.nodeName;
        with (this.parentNode) {
            replaceChild(this.firstChild, this);
            normalize();
        }
    }).end();
};