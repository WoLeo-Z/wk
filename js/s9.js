// leanModal v1.1 by Ray Stone - http://finelysliced.com.au
// Dual licensed under the MIT and GPL

(function($) {
    $.fn.extend({
        leanModal: function(options) {
            var defaults = {
                top: 100,
                overlay: 0.5,
                closeButton: null
            };
            var overlay = $("<div id='lean_overlay'></div>");
            $("body").append(overlay);
            options = $.extend(defaults, options);
            return this.each(function() {
                var o = options;
                $(this).click(function(e) {
                    var modal_id = $(this).attr("href");
                    $("#lean_overlay").click(function() {
                        close_modal(modal_id)
                    });
                    $(o.closeButton).click(function() {
                        close_modal(modal_id)
                    });
                    var modal_height = $(modal_id).outerHeight();
                    var modal_width = $(modal_id).outerWidth();
                    $("#lean_overlay").css({
                        "display": "block",
                        opacity: 0
                    });
                    $("#lean_overlay").fadeTo(200, o.overlay);
                    $(modal_id).css({
                        "display": "block",
                        "position": "fixed",
                        "opacity": 0,
                        "z-index": 11000,
                        "left": 50 + "%",
                        "margin-left": -(modal_width / 2) + "px",
                        "top": (o.top + 10) + "px"
                    });
                    $(modal_id).fadeTo(200, 1);
                    e.preventDefault()
                })
            });

            function close_modal(modal_id) {
                $("#lean_overlay").fadeOut(200);
                delCheckQrLoginIn();
                $(modal_id).css({
                    "display": "none"
                })
            }
        }
    })
})(jQuery);

(function(a) {
    a.switcher = function(c) {
        var b = a("input[type=checkbox],input[type=radio]");
        if (c !== undefined && c.length) {
            b = b.filter(c)
        }
        b.each(function() {
            var e = a(this).hide(),
                d = a(document.createElement("div")).addClass("ui-switcher").attr("aria-checked", e.is(":checked"));
            if ("radio" === e.attr("type")) {
                d.attr("data-name", e.attr("name"))
            }
            toggleSwitch = function(f) {
                if (f.target.type === undefined) {
                    e.trigger(f.type)
                }
                d.attr("aria-checked", e.is(":checked"));
                if ("radio" === e.attr("type")) {
                    a(".ui-switcher[data-name=" + e.attr("name") + "]").not(d.get(0)).attr("aria-checked", false)
                }
            };
            d.on("click", toggleSwitch);
            e.on("click", toggleSwitch);
            d.insertBefore(e)
        })
    }
})(jQuery);


var isloadJs = 1;

var server;

var timer;
var taskId;
var uuid;
var preurl;
var checkCount = 0;
var networkErrorCount = 0;
var dsErrorCount = 0;
var hasDowned = false;


var downClickCount = 0;
var checkKlClickCount = 0;


function startTask() {

    var isNoGo = $("#isNoGo").val();
    if (isNoGo == "1") {
        alert("???????????????????????????");
        return;
    }

    var val = $("#kValId").val();
    if (!val || val.indexOf("?????????????????????") > -1) {
        alert("?????????????????????");
        return false;
    }

    if (val.indexOf("baiduvvv") > 0) {
        val = val.replace("baiduvvv", "baidu");
    }

    hasDowned = false;
    checkCount = 0;
    networkErrorCount = 0;
    $("#downing").show();
    $("#subbtn").attr("disabled", true);
    $("#subbtn").text("?????????");
    $("#kValId").attr("disabled", true);

    $("#downingInfo").text("?????????????????????????????????????????????").css("color", "red");
    $("#bar").css("width", "0%").css("background", "#95CA0D");

    $("#searchDivId").addClass("filtergray");
    $("#subbtn").css("cursor", "default");
    $('input:radio[name="downType"]').attr("disabled", true);

    reputFromUrlForComment();
    /*
    window.setTimeout(function (){
          $("#subbtn").text("??????");
        $("#subbtn").attr("disabled",false);
    },10000);
    */
    val = encodeURIComponent(val);
    // var t=$("#t").val();
    // var sign=$("#sign").val();
    var t = $("input[name='t']").val();
    var sign = $("input[name='sign']").val();
    var type = $('input:radio[name="downType"]:checked').val();

    var dsUrl = preDir + "ds.php?url=" + val + "&type=" + type + "&t=" + t + "&sign=" + sign;
    var cparam = "url=" + val + "&type=" + type + "&t=" + t + "&sign=" + sign + "&c=" + devId;

    var hp = getCookie("hp");
    if (1 == hp) {
        cparam += "&np=1";
    }

    dsErrorCount = 0;
    ds(dsUrl, cparam);


}




function errorlog() {
    var type = $('input:radio[name="downType"]:checked').val();
    var val = $("#kValId").val();
    val = encodeURIComponent(val);

    $.ajax({
        type: "GET",
        url: "http://64.64.224.7/w/ch/errorlog.php?type=" + type + "&u=" + val,
        dataType: "jsonp",
        jsonp: "callback",
        jsonpCallback: "callback3",
        success: function(result) {

        },
        error: function(e) {
            console.log("errorlog error")

        }
    });


}



function ds(dsUrl, cparam) {
    dsErrorCount++;

    $.ajax({
        type: "GET",
        //	async: false,
        dataType: "json",
        url: dsUrl,
        success: function(result) {
            if (result) {
                if (result.code == 1) {
                    server = result.s;
                    preurl = server + "/wkc.php?" + cparam + "&f=" + result.f + "&h=" + result.h;
                    runStart(preurl);
                    return;
                } else if (result.code == -2) {
                    error3Down(result.msg);
                    return;
                }


            }
            error2Down();

        },
        error: function(e) {
            console.log("error", e)
            if (dsErrorCount > 3) {
                networkErrorDown();
            } else {
                ds(dsUrl, cparam);
            }

        }
    });

}

function runStart(preurl) {

    $.ajax({
        type: "GET",
        //	async: false,
        url: preurl + "&btype=start",
        dataType: "jsonp",
        jsonp: "callback",
        jsonpCallback: "callback2",
        success: function(result) {
            if (result) {
                if (result.code == 1) { // start
                    taskId = result.id;
                    uuid = result.uuid;
                    timer = setInterval(runProgress, 1000 * 3);

                    return;
                } else if (result.code == 2) { // success
                    doDown();
                    return;
                } else if (result.code == -1) { // fail
                    var msg = result.msg;
                    if (msg) {
                        error3Down(msg);
                    } else {
                        errorDown();
                    }
                    return;
                }

            }
            error2Down();

        },
        error: function(e) {
            networkErrorDown();
            errorlog();
        }
    });

}

function runProgress() {
    checkCount++;
    if (checkCount > 3600) {
        console.log("check too much,checkCount:" + checkCount);
        if (timer) {
            clearInterval(timer);
        }
        timer = null;
        return;
    }
    $.ajax({
        type: "GET",
        //	async: false,
        url: preurl + "&btype=getProgress&id=" + taskId + "&uuid=" + uuid,
        dataType: "jsonp",
        jsonp: "callback",
        jsonpCallback: "callback2",
        success: function(result) {
            networkErrorCount = 0;
            if (result) {
                if (result.code == 1 || result.code == 3) { // start
                    var p = result.p;
                    $("#bar").css("width", p + "%");
                    if (result.code == 3) {
                        if (result.isRuning) {
                            $("#downingInfo").text("????????????????????????????????????").css("color", "red");

                        } else {
                            $("#downingInfo").html("????????????????????????????????????????????????????????????????????????").css("color", "red");
                        }
                    }

                    return;
                } else if (result.code == 2) { // success
                    doDown();
                    return;
                } else if (result.code == -1) { // fail
                    var msg = result.msg;
                    if (msg) {
                        error3Down(msg);
                    } else {
                        errorDown();
                    }
                    return;
                }

            }
            error2Down();
        },
        error: function(e) {
            //	var test = e;
            networkErrorCount++;
            if (networkErrorCount > 15) {
                networkErrorDown();
            }

        }
    });


}


function runGo() {

    if (downClickCount >= 1) {
        alert("?????????????????????,?????????????????????,??????????????????");
        return;
    }
    downClickCount++;
    window.setTimeout(function() {
        downClickCount = 0;
    }, 5000);


    if (ick && !hasA) {
        var t = $("input[name='t']").val();
        var sign = $("input[name='sign']").val();
        var type = $('input:radio[name="downType"]:checked').val();
        var hsgt = getCookie("hsgt");
        var did = devId;
        var valurl = $("#kValId").val();

        valurl = encodeURIComponent(valurl);

        var cgUrl = preDir + "cg.php?dtype=hasAuth&type=" + type + "&t=" + t + "&sign=" + sign + "&hsgt=" + hsgt + "&did=" + did + "&url=" + valurl;

        $.ajax({
            type: "GET",
            //	async: false,
            dataType: "json",
            url: cgUrl,
            success: function(result) {
                if (result) {
                    if (result.code == 1) { // go
                        startTask();
                        return;
                    } else if (result.code == 2) { // show
                        try {
                            $('#modaltrigger').click()
                        } catch (_) {
                            console.log("clickshow error");
                            alert("???????????????");
                        }
                        return;
                    }


                } else {
                    alert("???????????????");
                }


            },
            error: function(e) {
                console.log("error", e)
                alert("?????????????????????????????????????????????????????????????????????");

            },
            complete: function(e) {

                downClickCount = 0;
            }

        });


    } else {
        startTask();

    }


}

function checkKouling() {

    var kouling = $("#kouling").val();
    if (!kouling || "???????????????" == kouling) {
        alert("?????????????????????");
        return;
    }


    if (checkKlClickCount >= 1) {
        alert("?????????????????????,?????????????????????,??????????????????");
        return;
    }
    checkKlClickCount++;
    window.setTimeout(function() {
        checkKlClickCount = 0;
    }, 5000);


    var did = devId;

    var cgUrl = preDir + "cg.php?dtype=checkKouling&kouling=" + kouling + "&did=" + did;

    $.ajax({
        type: "GET",
        //	async: false,
        dataType: "json",
        url: cgUrl,
        success: function(result) {
            if (result && result.code == 1) { // suc
                hasA = 1;
                setCookie("hsgt", result.h);
                $(".hidemodal").click();
                startTask();

            } else {
                if (result.msg) {
                    alert(result.msg);
                } else {
                    alert("???????????????");
                }
            }


        },
        error: function(e) {
            console.log("error", e)
            alert("???????????????");

        },


        complete: function(e) {

            checkKlClickCount = 0;
        }


    });




}






function networkErrorDown() {

    $("#downingInfo").html("?????????????????????????????????????????????").css("color", "red");
    errorDown_();
}

function error3Down(str) {
    if (str.indexOf("???????????????") > -1) {
        str = str.replace("??????????????????", "?????????????????????");
        try {
            $('#modaltrigger').click()
        } catch (_) {
            console.log("clickshow error");
        }
    }
    $("#downingInfo").html(str).css("color", "red");
    errorDown_();
}

function error2Down() {

    $("#downingInfo").html("????????????????????????????????????").css("color", "red");
    errorDown_();
}

function errorDown() {

    $("#downingInfo").html("??????????????????????????????????????????").css("color", "red");
    errorDown_();
}

function errorDown_() {
    if (timer) {
        clearInterval(timer);
    }
    timer = null;
    $("#bar").css("width", "100%").css("background", "red");

    //	$("#downingInfo").html("??????????????????????????????????????????").css("color","red");

}

function doDown() {
    if (timer) {
        clearInterval(timer);
    }
    timer = null;
    $("#bar").css("width", "100%");
    var downFile = preurl + "&btype=down&id=" + taskId + "&uuid=" + uuid;
    $("#subbtn").text("????????????");

    var type = $('input:radio[name="downType"]:checked').val();
    var lineAppend = "<a target='_blank' href='" + downFile + "' >??????</a>";
    if ("ppt" == type) {

        lineAppend = "<a target='_blank' href='" + downFile + "' >????????????1</a> <a target='_blank' href='" + downFile + "&redown=1' >????????????2</a>";
    }

    var line = "??????????????????????????????<span style='font-size:15px;color:#666'>???????????????????????? " + lineAppend + " ??????????????? </span>";
    $("#downingInfo").html(line).css("color", "blue");
    // location.href= downFile;
    if (!hasDowned) {
        hasDowned = true;
        location.href = downFile;
    } else {
        console.log("hasdowned location");
    }

}

function rePlay() {
    if (timer) {
        clearInterval(timer);
    }
    timer = null;
    $("#subbtn").text("??????");
    $("#subbtn").attr("disabled", false);
    $("#kValId").attr("disabled", false);
    $("#downing").hide();
    $("#searchDivId").removeClass("filtergray");
    $("#subbtn").css("cursor", "pointer");
    $('input:radio[name="downType"]').attr("disabled", false);
}



function reputFromUrlForComment() {
    var val = $("#kValId").val();
    var type = $('input:radio[name="downType"]:checked').val();
    val = val + "llltotype=" + type;

    val = encodeURIComponent(val);

    var url = "/comment.php?fromUrl=" + val;
    $("#goCommentId").attr("href", url);
}





var qcodesIsShow = false;

function showOrHideqcodes() {
    if (qcodesIsShow) {
        qcodesIsShow = false;
        $("#new-qcodes").hide();
    } else {
        qcodesIsShow = true;
        $("#new-qcodes").show();
    }


}

function hideqcodes() {
    qcodesIsShow = false;
    $("#new-qcodes").hide();


}

// s.js

function toast(msg) {
    setTimeout(function() {
        document.getElementsByClassName('toast-wrap')[0].getElementsByClassName('toast-msg')[0].innerHTML = msg;
        var toastTag = document.getElementsByClassName('toast-wrap')[0];
        toastTag.className = toastTag.className.replace('toastAnimate', '');
        setTimeout(function() {
            toastTag.className = toastTag.className + ' toastAnimate';
        }, 100);
    }, 100);
}


var loginTimer;

var qrCheckCount;
var hasLoadTaskList = false;

function jumpPage(goValId) {
    var page = $("#" + goValId).val();
    //alert(page)
    tasklist(page);

}

function tasklist(pageIndex) {
    var did = devId;
    if (!did) {
        did = getNewId();
    }
    if (!pageIndex) {
        pageIndex = 1;
    }
    $.ajax({
        type: "GET",
        //	async: false,
        url: preQsUrl + "/qr.json?dtype=tasklist&devid=" + did + "&pageIndex=" + pageIndex,
        dataType: "jsonp",
        jsonp: "callback",
        jsonpCallback: "callback2",
        success: function(result) {

            if (result && result.code) {

                if (result.hasLogin) { // ?????????
                    $("#nologinDiv").hide();
                    $("#hasLoginDiv").show();
                    $("#listPageDiv").show();
                    $("#task_remind").show();


                    $("#loginNameDiv").text(result.username);

                    if (result.sign) {
                        $("#tId").val(result.t);
                        $("#signId").val(result.sign);
                    }

                    $("#needNoticeDiv").show();


                    if (!hasLoadTaskList) {
                        var isNeedNotice = result.isNeedNotice;
                        if (isNeedNotice == 1) {
                            $("#isNeedNotice").attr("checked", true);
                        }
                        $.switcher();
                    }
                    hasLoadTaskList = true;


                    var totalNumber = result.count;
                    var pageIndex = result.pageIndex;
                    var allPage = result.allPage;
                    var prePage = result.prePage;
                    var nextPage = result.nextPage;
                    var pageSize = result.pageSize;
                    $("#totalNumber").text(totalNumber);
                    $("#currentIndex").text(pageIndex);
                    $("#totalPage").text(allPage);

                    $("#preIndex").val(prePage);
                    $("#nextIndex").val(nextPage);
                    $("#pageSize").text(pageSize);

                    if (result.list) {
                        var taskBody = $("#tasklistBody");
                        taskBody.empty();
                        var list = result.list;
                        for (var i = 0; i < list.length; i++) {
                            var item = list[i];
                            var docUrl = item.docUrl;
                            var oid = item.id;
                            var targetTypeName = item.targetTypeName;
                            var targetType = item.targetType;
                            var addTime = item.addTime;
                            var endTime = item.endTime;
                            var stateName = item.stateName;
                            var result = item.result;
                            var proce = item.process;
                            var proceStyle = "";
                            if (proce == -1) {
                                proce = 100;
                                proceStyle = "background:red";
                            }

                            var editadd = "";
                            if (result == 1) {
                                editadd = '   <a data-index="0" onclick="downFileFromTasklist(this)" class="layui-btn layui-btn-mini mapping-edit">??????</a>    ';
                            }
                            var line = '<tr><td   >' +
                                '  <a class="tdfirst" href="" target="_blank"></a></td>' +
                                '<td>' + targetTypeName + '</td>' +
                                '<td>' + addTime + '</td>' +
                                ' <td>' +
                                '<div class="barcontainer"  >' +
                                '	<div class="barprocess" style="width: ' + proce + '%;' + proceStyle + '"></div>' +
                                '</div>' +
                                '   </td>' +
                                ' <td class="stateColor' + result + '">' + stateName + '</td>' +
                                '  <td>' +
                                editadd '  </td>' +
                                ' </tr>';
                            var lineOb = $(line);
                            lineOb.attr("docUrl", docUrl);
                            lineOb.attr("oid", oid);

                            lineOb.attr("targetTypeName", targetTypeName);
                            lineOb.find(".tdfirst").text(docUrl).attr("href", docUrl);
                            taskBody.append(lineOb);
                        }

                    }

                    return;
                }




            }
            //console.log("checkLogin no suc")
        },
        error: function(e) {
            //	var test = e;
            console.log("checkLogin error")

        }
    });


}

function downFileFromTasklist(ob) {
    var trOb = $(ob).parent().parent();

    var docUrl = trOb.attr("docUrl");
    var type = trOb.attr("targetTypeName");
    var oid = trOb.attr("oid");

    //t,sign,devId
    var t = $("#tId").val();
    var sign = $("#signId").val();

    var dsUrl = preDir + "ds.php?url=" + docUrl + "&type=" + type + "&t=" + t + "&sign=" + sign;
    var cparam = "url=" + docUrl + "&type=" + type + "&t=" + t + "&sign=" + sign + "&c=" + devId;
    $.ajax({
        type: "GET",
        //	async: false,
        dataType: "json",
        url: dsUrl,
        success: function(result) {
            if (result) {
                if (result.code == 1) {
                    server = result.s;
                    preurl = server + "/wkc.php?" + cparam + "&f=" + result.f + "&h=" + result.h;
                    //runStart(preurl);
                    var downUrl = preurl + "&btype=down&uuid=" + oid;
                    location.href = downUrl;
                    return;
                }


            }


        },
        error: function(e) {
            console.log("error", e)


        }
    });

}

function loginOut(isRefresh) {
    var did = devId;

    $.ajax({
        type: "GET",
        //	async: false,
        url: preQsUrl + "/qr.json?dtype=loginout&devid=" + did,
        dataType: "jsonp",
        jsonp: "callback",
        jsonpCallback: "callback2",
        success: function(result) {

            if (result && result.outLogin) {

                if (isRefresh) {
                    window.location.reload();
                } else {
                    $("#nologinDiv").show();
                    $("#hasLoginDiv").hide();
                    $("#downingRemindLogin").show();
                    // $("#loginNameDiv").text(result.username);

                }


            }

        },
        error: function(e) {
            //	var test = e;
            console.log("checkLogin error")

        }
    });


}


function changeNeedNotice() {
    var did = devId;
    var isCheck = 0;
    if ($("#isNeedNotice").is(':checked')) {
        isCheck = 1;
    }

    $.ajax({
        type: "GET",
        //	async: false,
        url: preQsUrl + "/qr.json?dtype=changeNeedNoticeByDevid&needNotice=" + isCheck + "&devid=" + did,
        dataType: "jsonp",
        jsonp: "callback",
        jsonpCallback: "callback2",
        success: function(result) {

            if (result) {



            }

        },
        error: function(e) {
            //	var test = e;
            console.log("changeNeedNotice error")

        }
    });


}


function checkLogin(isQrCheck) {
    var did = devId;
    if (isQrCheck) {
        qrCheckCount++;
        if (qrCheckCount > 3600) {
            console.log("qrCheckCount too much,qrCheckCount:" + qrCheckCount);
            delCheckQrLoginIn();
            return;
        }

    }

    $.ajax({
        type: "GET",
        //	async: false,
        url: preQsUrl + "/qr.json?dtype=checkLogin&devid=" + did,
        dataType: "jsonp",
        jsonp: "callback",
        jsonpCallback: "callback2",
        success: function(result) {

            if (result && result.username) { // ?????????

                //  if(result.url){

                $("#nologinDiv").hide();
                $("#hasLoginDiv").show();
                $("#downingRemindLogin").hide();
                $("#loginNameDiv").text(result.username);
                if (isQrCheck) {
                    delCheckQrLoginIn();
                    $(".hidemodal").click();

                    toast('????????????');

                    var downingInfo = $("#downingInfo").html();
                    if (downingInfo && downingInfo.indexOf("??????????????????") > -1) {
                        $("#downingInfo").html("???????????????????????????????????????");
                    }

                    if (isTaskList) {
                        window.location.reload();
                    }

                }

                return;
                //    }

            }
            //console.log("checkLogin no suc")
        },
        error: function(e) {
            //	var test = e;
            console.log("checkLogin error")

        }
    });


}


function delCheckQrLoginIn() {
    if (loginTimer) {
        clearInterval(loginTimer);

    }
    loginTimer = null;
}

function checkQrLoginIn() {
    checkLogin(1);

}

function showQr() {
    var did = devId;
    if (!did) {
        did = getNewId();
    }
    $.ajax({
        type: "GET",
        //	async: false,
        url: preQsUrl + "/qr.json?dtype=showqrcode&devid=" + did,
        dataType: "jsonp",
        jsonp: "callback",
        jsonpCallback: "callback2",
        success: function(result) {

            if (result) {

                if (result.url) {

                    $("#qrcodeImg").show();
                    $("#qrcodeLoding").hide();
                    $("#qrcodeImg").attr("src", result.url);
                    $("#qrcodeImgA").attr("href", result.url);
                    if (isWap) {

                        $("#wShowId").show();
                    }

                    console.log("isWap" + isWap);
                    loginTimer = setInterval(checkQrLoginIn, 1000 * 3);

                    return;
                }

            }
            console.log("showqrcode no suc")
        },
        error: function(e) {
            //	var test = e;
            console.log("showqrcode error")

        }
    });


}



function getNewId() {
    var uid = getv("userId");
    if (uid) {

    } else {
        uid = randomString();
        putv("userId", uid);
    }
    return uid;
}





function randomString() {
    var pwd = '';
    var len = 32;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = chars.length;

    for (i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }

    return pwd;
}

function getCookie(c_name) {

    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1)
                c_end = document.cookie.length
            return unescape(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}



function setCookie(name, value) {
    var exp = new Date();
    exp.setTime(exp.getTime() + 60 * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + encodeURIComponent(value) +
        ";expires=" + exp.toGMTString() + ";path=/";
    return true;
}



function setCookie2(name, value, date) {

    if (!date) {
        date = 360;
    }
    var exp = new Date();
    exp.setTime(exp.getTime() + date * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + encodeURIComponent(value) +
        ";expires=" + exp.toGMTString() + ";path=/";
    return true;
}




function fzq(s) {
    if (s) {
        s = s.replace(/ /g, "@").replace(/,/g, ".").replace(/\//g, "@");
        s = encodeURI(s);
        if (s.length > 2000) {
            s = "@@" + s.substring(0, 2000);
        }
        s = s.split('').reverse().join('');

        return s;

    }
    return "";
}


function stfsl() {
    try {
        zwglo = getv("zwg");
        if (!zwglo) {

            fsl();
        } else {
            fsck();

        }

    } catch (err) {
        console.log(err)
    }

}



function fsck() {

    var did = devId;
    var add = "";
    var shot = getv("shot");
    if (shot) {
        add = shot;
    } else {
        add = "zw=" + zwglo + "&fo=no";
    }

    var dsUrl = "/zh/ck/?di=" + did + "&" + add + "&t=" + new Date().getTime();
    $.ajax({
        type: "GET",
        url: dsUrl,
        success: function(result) {
            if (result) {
                tmwflag = 1;

            }

        },
        error: function(e) {

        }
    });

}

function fsload(longs) {
    var did = devId;

    var dsUrl = "/zh/wf/?di=" + did + "&" + longs + "&t=" + new Date().getTime();
    $.ajax({
        type: "GET",
        url: dsUrl,
        success: function(result) {
            if (result) {
                tmwflag = 1;

            }

        },
        error: function(e) {

        }
    });

}


function putv(k, v) {

    setCookie(k, v);
    if (window.localStorage) {
        // alert("???????????????localstorage");

        var storage = window.localStorage;
        try {
            storage[k] = v;
        } catch (_) {
            //console.log("???????????????????????????");
        }
    }


}

function getv(k) {
    var v = "";
    if (window.localStorage) {
        var storage = window.localStorage;
        try {
            v = storage[k];
        } catch (_) {
            //console.log("???????????????????????????");
        }

    }
    var v2 = getCookie(k);
    if (!v) {
        v = v2;
        putv(k, v);
    } else {
        if (!v2) {
            putv(k, v);
        }

    }
    return v;
}