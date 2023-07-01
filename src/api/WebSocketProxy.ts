export async function WebSocketProxy(request: Request): Promise<Response> {
    if(request.method==="OPTIONS"){
        return new Response("",{
            headers:{
                "Access-Control-Allow-Origin":"*"
            }
        })
    }
    let url = new URL(request.url);
    let urldata =  url.searchParams.get("ProxyData");
    if(!urldata){
        return returnError("没有ProxyData参数");
    }
    let data:{
        headers?:any,
        url?:string
    };
    try{
        data = JSON.parse(urldata);
    }catch(error){
        return returnError(error+"","error");
    }
    if(!data){
        return returnError("错误的ProxyData");
    }
    try{
        if(!data.url){
            return returnError("错误的Url"+url);
        }
        let requesturl;
        try{
             requesturl = new URL(url);
        }catch(error){
            return returnError("错误的Url:"+error);
        }

        if(requesturl.protocol.startsWith('wss')){
            requesturl.protocol = "https";
        }else if(requesturl.protocol.startsWith('ws')){
            requesturl.protocol = "http";
        }
    
        let qH = new Headers(data.headers);
        headersCopy(request.headers,qH,["Upgrade","Connection","Sec-WebSocket-Key","Sec-WebSocket-Version","Sec-WebSocket-Protocol","Sec-WebSocket-Extensions"]);
        // console.log("1111")
        let re = await fetch(requesturl,{
            method:request.method,
            body:request.body,
            headers:qH,
        });
        // console.log("2222")
        return re;

        // let reH = new Headers(re.headers);
        // reH.set("Access-Control-Allow-Origin","*");
        // let r = new Response(re.body,{
        //     headers:reH,
        //     status:re.status
        // });
        // return r;
    }catch(error){
        return returnError(error+"","error");
    }
}

function headersCopy(from:Headers,to:Headers,names:Array<string>){
    for(let h of names){
        let the = from.get(h);
        if(the){
            to.set(h,the);
        }
    }
}


function returnError(message:string,type:string = "null"){
    console.log(type,message)
    let response = new Response(message,{
        headers:{
            "Access-Control-Allow-Origin":"*",
            "Access-Control-Expose-Headers":"ProxyErrorType",
            "ProxyErrorType":type,
        },
        status:400,
    });
    return response;
}