

console.log("First line")

const promise  = getStudent(1) 

promise 
.then((student)=>{
    console.log(student)
})
.catch((error)=>{
    console.log(error)
})

function getStudent(id)
{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            const student={
                id:id,
                name:"John Doe"
            }
            resolve(student)
        },2000)
    })
}