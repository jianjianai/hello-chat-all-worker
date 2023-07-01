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
    let data;
    try{
        data = JSON.parse(urldata);
    }catch(error){
        return returnError(error+"","error");
    }
    if(!data){
        return returnError("错误的ProxyData");
    }
    try{
        let re = await fetch(data.url,{
            method:request.method,
            body:request.body,
            headers:data.headers,
        });
        let he = new Headers(re.headers);
        he.set("Access-Control-Allow-Origin","*");
        let r = new Response(re.body,{
            headers:he,
            status:re.status
        });
        return r;
    }catch(error){
        return returnError(error+"","error");
    }
}


function returnError(message:string,type:string = "null"){
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