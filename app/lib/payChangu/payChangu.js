import $ from 'jquery';

function showSpinner(B) {
    var o = document.createElement("div");
    if ("undefined" === B) {
        const A = document.createElement("style");
        (A.textContent = `.page-loading {position:fixed;top:0;right:0;bottom:0;left:0;width:100%;height:100%;-webkit-transition:all .4s .2s ease-in-out;transition:all .4s .2s ease-in-out;background-color:rgba(0, 0, 0, 0.5);-webkit-backdrop-filter: blur(10px);backdrop-filter: blur(10px);visibility:hidden;z-index:9999}.dark-mode .page-loading{background-color:#0b0f19}.page-loading.active{opacity:1;visibility:visible}.page-loading-inner{position:absolute;top:50%;left:0;width:100%;text-align:center;-webkit-transform:translateY(-50%);transform:translateY(-50%);-webkit-transition:opacity .2s ease-in-out;transition:opacity .2s ease-in-out;opacity:0}.page-loading.active>.page-loading-inner{opacity:1}.page-loading-inner>span{display:block;font-size:1rem;font-weight:400;color:#9397ad}.dark-mode .page-loading-inner>span{color:#fff;opacity:.6}.page-spinner{display:inline-block;width:2.75rem;height:2.75rem;margin-bottom:.75rem;vertical-align:text-bottom;border:.15em solid #fff;border-right-color:transparent;border-radius:50%;-webkit-animation:spinner .2s linear infinite;animation:spinner .2s linear infinite}.dark-mode .page-spinner{border-color:rgba(255,255,255,.4);border-right-color:transparent}@-webkit-keyframes spinner{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes spinner{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}`),
            document.head.appendChild(A),
            document.documentElement.appendChild(Object.assign(o, { innerHTML: '<div class="page-loading active text-white"><div class="page-loading-inner"><div class="page-spinner"></div></div></div>' }));
    } else {
        const A = document.createElement("style");
        if (document.querySelector('.page-loading')) {
            (A.textContent = "html,body{margin: 0;overflow-y: visible}"), document.head.appendChild(A), document.querySelector('.page-loading').remove();
        }
    }
}

function hideSpinner() {
    const A = document.getElementById("my-spinner");
    console.log(A), A.parentNode && A.parentNode.removeChild(A);
}

function buildDataModal(data, type) {
    let $wrapper = $('<div id="myModal" class="fmodal"></div>')
    let $dialogDiv = $('<div class="fmodal-content"></div>')
    if (type == "message") {
        var message = data.message;
    } else {
        let ss = [];
        validate = data.validate;
        for (const key in validate) {
            ss = validate[key];
        }
        var message = ss;
    }
    $dialogDiv.append('<span class="close">&times;</span><p>' + message + '</p>')
    $wrapper.append($dialogDiv)
    $('body').append($wrapper)
    document.getElementById("myModal").style.display = "block";
    document.getElementsByClassName("close")[0].onclick = function () {
        document.getElementById("myModal").style.display = "none";
    }
}
window.onclick = function (event) {
    if (event.target == document.getElementById("myModal")) {
        document.getElementById("myModal").style.display = "none";
    }
}
function setAttributes(A, o) {
    for (var e in o) A.setAttribute(e, o[e]);
}
function css(A, o) {
    for (const e in o) A.style[e] = o[e];
}
function removeIframe() {
    const A = document.querySelector("#iframe1");
    A.parentNode.removeChild(A);
}

function redirectBack(A) {
    window.location.href = A;
}

function buildLoader(A) {
    document.body;
    let o = document.createElement("style"),
        e = document.createElement("span");
    document.body.append(
        Object.assign(o, {
            textContent:
                "@keyframes coolrotate { from { transform: scale(1, 1) translate(-0.1em, 0)} to { transform: scale(-1, 1) translate(0, 0) }} small { display: inline-block; font-size:2.3em; animation: 1s infinite alternate coolrotate } body {font-size: x-large}",
        }),
        Object.assign(e, { innerHTML: "<span>c</span><small>o</small><span>o</span><small>L</small><small>...</small>", style: "font-weight: 1000; font-size: 3.3em;" })
    );
}
function insertStyleSheetRule(A) {
    let o = document.styleSheets;
    if (0 == o.length) {
        let A = document.createElement("style");
        A.appendChild(document.createTextNode("")), document.head.appendChild(A);
    }
    let e = o[o.length - 1];
    e.insertRule(A, e.rules ? e.rules.length : e.cssRules.length);
}

function buildIframe(A, o) {
    let e = document.getElementById("wrapper"),
        g = document.createElement("iframe");
    setAttributes(g, o),
        css(g, { position: "fixed", top: 0, bottom: 0, right: 0, width: "100%", border: "none", margin: 0, padding: 0, overflow: "hidden", "z-index": 9999, height: "100%", "overflow-y": "hidden" }),
        showSpinner("undefined"),
        "complete" === document.readyState &&
        ((g.onload = function () {
            showSpinner("show");
        }),
        e.appendChild(g));
}

window.addEventListener('message', event => {
    if (event.data == "removeIframe") {
        const iframe1 = window.parent.document.querySelector('#iframe1');
        if (iframe1) {
            iframe1.remove();
        }
    }
});

export function PaychanguCheckout(A) {
    showSpinner("undefined");
    const o = {
        tx_ref: A.tx_ref,
        amount: A.amount,
        currency: A.currency,
        callback_url: A.callback_url,
        return_url: A.return_url,
        customer: { 
            email: typeof(A.customer) != "undefined" ? A.customer.email : null, 
            first_name: typeof(A.customer) != "undefined" ? A.customer.first_name : null, 
            last_name: typeof(A.customer) != "undefined" ? A.customer.last_name : null 
        },
        customization: {
            title: typeof(A.customization) != "undefined" ? A.customization.title : null, 
            description: typeof(A.customization) != "undefined" ? A.customization.description : null, 
            logo: typeof(A.customization) != "undefined" ? A.customization.logo : null, 
        },
        meta: A.meta,
    };
    
    const endpointUrl = "https://api.paychangu.com" + "/popup_transfer";

    fetch(endpointUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + A.public_key,
        },
        body: JSON.stringify(o)
    })
    .then((A) => A.json())
    .then((A) => {
        if (null != A.data) {
            const o = A.data.checkout_url;
            showSpinner(A), buildIframe(o, { src: o, id: "iframe1", class: "checkout-iframe-block", width: 400, height: 200, scrolling: "auto" });
        }
        else{
            if(typeof(A.message) == 'object'){
                showSpinner(A),
                A.validate = A.message;
                buildDataModal(A, "validate")
            }
            else{
                showSpinner(A), A.hasOwnProperty("message") ? buildDataModal(A, "message") : buildDataModal(A, "validate");
            }
        }
    })
    .catch((A) => {
        console.error("Error:", A);
        showSpinner(A)
        buildDataModal({message: "A technical error has ocurred. Please try again"}, "message");
    });
}

document.addEventListener("DOMContentLoaded", (A) => {
    insertStyleSheetRule(".fmodal {display: none;position: fixed;z-index: 1;padding-top: 100px;left: 0;top: 0;width: 100%;height: 100%;overflow: auto;background-color: rgb(0,0,0);background-color: rgba(0,0,0,0.4);}"),
    insertStyleSheetRule(".fmodal-content {background-color: #fefefe;margin: auto;padding: 20px;border: 1px solid #888;width: 40%; text-align:center}"),
    insertStyleSheetRule(".close {color: #aaaaaa;float: right;font-size: 28px;font-weight: bold;}"),
    insertStyleSheetRule(".close:hover,.close:focus {color: #000;text-decoration: none;cursor: pointer;}");
});