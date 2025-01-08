import bcrypt from 'bcrypt'

type hashPasswordType=(p:string)=>Promise<string>

const hashPassword:hashPasswordType = async (password)=>{
    const hashedPassword= await bcrypt.hash(password,10);
    return hashedPassword;
}

export default hashPassword;