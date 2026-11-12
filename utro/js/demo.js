// Демо-версия: форма показывает успешную отправку без сервера
(function(){var f=window.fetch;window.fetch=function(u,o){if(String(u).indexOf('send.php')>=0){return Promise.resolve(new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json'}}));}return f.apply(this,arguments);};})();
