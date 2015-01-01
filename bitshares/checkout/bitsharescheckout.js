/*! bitsharescheckout - v1.0.0-SNAPSHOT - 2015-01-01
 * https://github.com/sidhujag/bitsharescheckout
 * Copyright (c) 2015 Jag Sidhu;
 * Licensed 
 */
function ajaxLookup(serializedData){$.ajax({url:"callbacks/callback_lookup.php",type:"post",dataType:"json",timeout:15e3,data:serializedData,beforeSend:function(){},complete:function(){globalInitDialog.close(),$("#payNow").focus()},error:function(jqXHR,textStatus){var res=textStatus;""!==jqXHR.responseText&&(res=jqXHR.responseText),noty({text:res,type:"error"}),btsUpdateUIPaymentFail()},success:function(response){response?response.error?(noty({text:response.error,type:"error"}),btsUpdateUIPaymentFail()):0===globalTotal&&""===globalAsset&&(globalTotal=response.total,globalAsset=response.asset,$("#amount").val(globalTotal+" "+globalAsset)):btsUpdateUIPaymentFail()}})}function ajaxPay(serializedData){$.ajax({url:"callbacks/callback_pay.php",type:"post",dataType:"json",timeout:15e3,data:serializedData,beforeSend:function(){globalLoadingDialog.open()},complete:function(){globalLoadingDialog.close()},error:function(jqXHR,textStatus){var res=textStatus;""!==jqXHR.responseText&&(res=jqXHR.responseText),noty({text:res,type:"error"}),btsUpdateUIPaymentFail()},success:function(response){var textresponse="Payment processing...";response?response.error?(noty({text:response.error,type:"error"}),btsUpdateUIPaymentFail()):response.url&&(noty({text:textresponse,type:"success"}),response.url.length>1&&(window.location.href=response.url),btsStartPaymentTracker(serializedData),btsShowPaymentStatus()):btsUpdateUIPaymentFail()}})}function ajaxCancel(myurl,serializedData){$.ajax({url:myurl,type:"post",dataType:"json",timeout:15e3,data:serializedData,beforeSend:function(){globalLoadingDialog.open()},complete:function(){globalLoadingDialog.close()},error:function(jqXHR,textStatus){var res=textStatus;""!==jqXHR.responseText&&(res=jqXHR.responseText),noty({text:res,type:"error"}),btsUpdateUIReturnError()},success:function(response){if(response){var textresponse="Returning to checkout...If you are not redirected click <a href='"+response.url+"'>here</a>";noty({text:textresponse,type:"success",timeout:!1}),response.url&&(window.location.href=response.url)}}})}function ajaxSuccess(myurl,serializedData){$.ajax({url:myurl,type:"post",timeout:15e3,dataType:"json",data:serializedData,beforeSend:function(){globalLoadingDialog.open()},complete:function(){globalLoadingDialog.close()},error:function(jqXHR,textStatus){var res=textStatus;""!==jqXHR.responseText&&(res=jqXHR.responseText),noty({text:res,type:"error"}),btsUpdateUIReturnError()},success:function(response){if(response){var textresponse="Returning to checkout...If you are not redirected click <a href='"+response.url+"'>here</a>";noty({text:textresponse,type:"success",timeout:!1}),response.error&&noty({text:response.error,type:"error"}),response.url&&(window.location.href=response.url)}}})}function ajaxScanChain(serializedData){$.ajax({url:"callbacks/callback_verifysingleorder.php",type:"post",timeout:15e3,dataType:"json",data:serializedData,beforeSend:function(){},complete:function(){},error:function(jqXHR,textStatus){var res=textStatus;""!==jqXHR.responseText&&(res=jqXHR.responseText),noty({text:res,type:"error"})},success:function(response){if(response)if(response.error)noty({text:response.error,type:"error"});else{response.length>0&&$("#paymentStatusTable tbody").empty();for(var totalAmountReceived=0,complete=!1,processing=!1,i=0;response.length>i;i++)processing=!0,("complete"===response[i].status||"overpaid"===response[i].status)&&(complete=!0,processing=!1),totalAmountReceived+=parseFloat(parseFloat(response[i].amount)),$("#paymentStatusTable").find("tbody").append($("<tr>").append($("<td>").text(i+1)).append($("<td>").append($("<a>").attr("class","trxLink").attr("href","bts:Trx/"+response[i].trx_id).text(response[i].trx_id.substr(0,10)+"..."))).append($("<td>").attr("class","text-right").text(parseFloat(response[i].amount).toFixed(2)+" "+response[i].asset)));$("a.trxLink").click(function(e){e.preventDefault?e.preventDefault():e.returnValue=!1,window.location.href=$(this).attr("href")}),totalAmountReceived>0&&(globalAmountReceived=totalAmountReceived),complete?(setTimeout(function(){btsPaymentComplete()},5e3),clearInterval(globalPaymentTimer),btsUpdateUIFullPayment()):processing&&btsUpdateUIPartialPayment()}}})}function GetURLParameter(sParam){for(var sPageURL=window.location.search.substring(1),sURLVariables=sPageURL.split("&"),i=0;sURLVariables.length>i;i++){var sParameterName=sURLVariables[i].split("=");if(sParameterName[0]===sParam)return sParameterName[1]}}function btsStartPaymentTracker(serializedData){globalScanInProgress||(btsUpdateUIScan(),globalPaymentTimer&&clearInterval(globalPaymentTimer),ajaxScanChain(serializedData),globalPaymentTimer=setInterval(function(){ajaxScanChain(serializedData)},1e4))}function btsShowSuccess(){globalRedirectDialog.open();var countdown=10;globalRedirectCountdownTimer&&clearInterval(globalRedirectCountdownTimer),globalRedirectCountdownTimer=setInterval(function(){countdown--,$("#redirectCountdown").text("You will be automatically redirected back to the merchant site within "+countdown+" seconds..."),0>=countdown&&(clearInterval(globalRedirectCountdownTimer),ajaxSuccess("callbacks/callback_success.php",$("#btsForm").serialize()))},1e3)}function btsPaymentComplete(){globalPaid=!0,btsShowSuccess()}function btsExportPaymentTableToCSV(){window.location.href="../exportCSV.php?memo="+$("#memo").val()+"&order_id="+$("#order_id").val()}function btsShowPaymentStatus(){$("#exportCSV").removeClass("invisible"),$("#paymentStatus").removeClass("hidden"),btsStartPaymentTracker($("#btsForm").serialize())}function btsUpdateOnChange(){globalScanInProgress&&BootstrapDialog.warning("You have cancelled the current payment scan!"),btsUpdateUIScanClear()}function btsPayClick(){globalPaid?BootstrapDialog.danger("This order has already been paid for!"):globalAmountReceived>0?BootstrapDialog.confirm("There are partial payment(s) on this order. Would you like to pay the remaining balance of "+$("#paymentBalance").text()+"?",function(result){result&&ajaxPay($("#btsForm").serialize())}):ajaxPay($("#btsForm").serialize())}function btsUpdateUIDefault(){$("#myForm .fa-robo").removeClass("success fail"),$("#myForm").removeClass("fail animated"),$("#paymentMessage").html("Scanning for payments on the blockchain for this order...<br /><br />"),$("#return").text("Cancel and return to merchant"),$("#paymentProgressOuter").addClass("active");var balance=globalTotal-globalAmountReceived;0>balance&&(balance=0),balance=parseFloat(balance).toFixed(2),$("#paymentBalance").text(balance+" "+globalAsset);var amount=parseFloat(globalAmountReceived).toFixed(2);$("#paymentTotalReceived").text(amount+" "+globalAsset)}function btsUpdateUIPaymentFail(){$("#myForm .fa-robo").removeClass("success").addClass("fail"),$("#myForm").addClass("fail")}function btsUpdateUIScanClear(){globalAmountReceived=0,globalTotal=0,globalAsset="",btsUpdateUIDefault(),globalPaid=!1}function btsUpdateUIScanComplete(){globalNeedScan=!1,globalScanInProgress=!1,$("#paymentMessage").text("Scan complete"),$("#paymentProgressOuter").removeClass("active")}function btsUpdateUIScan(){globalScanInProgress=!0,btsUpdateUIDefault(),$("#paymentProgressOuter").addClass("active"),$("#paymentMessage").html("Scanning for payments on the blockchain for this order...<br /><br />")}function btsUpdateUIPayment(){var amountReceived=parseFloat(globalAmountReceived).toFixed(2),balance=globalTotal-globalAmountReceived;0>balance&&(balance=0),balance=parseFloat(balance).toFixed(2),$("#paymentBalance").text(balance+" "+globalAsset),$("#paymentTotalReceived").text(amountReceived+" "+globalAsset)}function btsUpdateUIPartialPayment(){btsUpdateUIPayment();var paymentmessage="Payment found. You still have a balance. ";paymentmessage+=globalScanInProgress?"Scanning further for any remaining payments...":"Please click 'Scan Again' to keep looking for more payments...",paymentmessage+="<br /><br />",$("#paymentMessage").html(paymentmessage)}function btsUpdateUIFullPayment(){btsUpdateUIPayment(),btsUpdateUIScanComplete(),$("#myForm .fa-robo").removeClass("fail").addClass("success"),$("#myForm").removeClass("fail").removeClass("animated"),$("#return").text("I'm done! Return to merchant"),$("#returnIcon").removeClass("fail").addClass("success shake"),$("#paymentMessage").html("Payment complete...<br /><br />")}function btsUpdateUIReturnError(){$("#returnIcon").removeClass("success").addClass("fail")}$(document).ready(function(){var accountName=GetURLParameter("accountName"),order_id=GetURLParameter("order_id"),memo=GetURLParameter("memo");$("#accountName").val(accountName),$("#accountNameDisplay").text(accountName),$("#order_id").val(order_id),$("#memo").val(memo),$("#payTo").val(accountName);var subject="Bitshares payment URL for order "+memo,url=encodeURIComponent(window.location.href);$("#socialMail").attr("href","mailto:?subject="+subject+"&body="+url),$("#socialGoogle").attr("href","https://plus.google.com/share?url="+url),$("#socialFacebook").attr("href","http://www.facebook.com/sharer.php?m2w&s=100&p[url]="+url+"&p[images][0]=http://bitshares.org/wp-content/uploads/2014/11/bts-logo-white.png&p[title]=Bitshares payment gateway&p[summary]="+subject),$("#socialTwitter").attr("href","http://twitter.com/intent/tweet?source=sharethiscom&text="+subject+"&url="+url),ajaxLookup($("#btsForm").serialize())}),$("input[type='text'], input[type='number']").change(function(){btsUpdateOnChange()}),$("#exportCSV").click(function(e){e.preventDefault?e.preventDefault():e.returnValue=!1,btsExportPaymentTableToCSV()}),$("#btsForm").submit(function(e){e.preventDefault?e.preventDefault():e.returnValue=!1,btsPayClick()}),$("#paymentStatus").click(function(e){e.preventDefault?e.preventDefault():e.returnValue=!1,btsShowPaymentStatus()}),$("#return").click(function(e){e.preventDefault?e.preventDefault():e.returnValue=!1,globalPaid?ajaxSuccess("callbacks/callback_success.php",$("#btsForm").serialize()):BootstrapDialog.confirm("This will cancel your order. Are you sure?",function(result){result&&ajaxCancel("callbacks/callback_cancel.php",$("#btsForm").serialize())})});var globalNeedScan=!0,globalPaid=!1,globalPaymentTimer=null,globalScanInProgress=!1,globalRedirectCountdownTimer=null,globalAmountReceived=0,globalTotal=0,globalAsset="";$.noty.defaults.layout="topRight",$.noty.defaults.theme="relax",$.noty.defaults.timeout=1e4,$.noty.defaults.animation.open="animated flipInX",$.noty.defaults.animation.close="animated flipOutX",$.noty.defaults.animation.easing="swing";var globalInitDialog=new BootstrapDialog({title:"Initializing",message:"Please wait a moment while we set things up...",autodestroy:!1,closable:!1,buttons:[]}),globalLoadingDialog=new BootstrapDialog({title:"Loading",message:"Please wait a moment...",autodestroy:!1,closable:!1,buttons:[]});globalInitDialog.open();var globalRedirectDialog=new BootstrapDialog({title:"Payment Complete",message:$("<div></div>").load("template/success.html"),autodestroy:!1,closable:!1,closeByBackdrop:!1,buttons:[{label:"Cancel",cssClass:"btn-primary",action:function(dialogItself){globalRedirectCountdownTimer&&(clearInterval(globalRedirectCountdownTimer),globalRedirectCountdownTimer=null),dialogItself.close()}}]});