import { createParamDecorator, ExecutionContext } from '@nestjs/common';


//so ken nprovidilou like nheb ken email iraj3li makenech iraja3li luser kemel  see user controller
//the user is tored in the request 
export const GetUser = createParamDecorator(
  (data: string |undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
if(data){
  return request.user[data] ;
}

    return request.user;
  },
);