export function confirmPromise(message:string, title:string):Promise<any>{
    return new Promise<any>((resolve,reject)=>{
        // let out = confirm(message)
        // if (!out){
        //     return reject();
        // }
        return resolve(confirm(message));
    });
}