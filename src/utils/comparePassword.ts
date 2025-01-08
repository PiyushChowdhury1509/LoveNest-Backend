import bcrypt from 'bcrypt';

type comparePasswordType=(p1:string,p2:string)=>Promise<boolean>

const comparePassword:comparePasswordType= async (p1,p2)=>{
    return bcrypt.compare(p1,p2);
}

export default comparePassword;