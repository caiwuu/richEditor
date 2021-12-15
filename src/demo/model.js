class T{
  constructor(input){
    this.init.call(input,input)
    return input
  }
  init(input){
    input.getName=()=>{
      return this.name
    }
  }
}
let t = new T({name:"caiwu"})
t.name='sss'
console.log(t.name);
console.log(t.getName());