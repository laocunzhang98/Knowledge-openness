class A {
  constructor(){
    this.nameA = "A"
  }
  validateA(){
    console.log("A")
  }
}

class B extends A {
  constructor(){
    super()
    this.nameB = "B"
  }
  validateB(){
    console.log("B")
  }
}

class C extends B {
  constructor(){
    super()
    this.nameC = "C"
  }
  validateC(){
    console.log("C")
  }
}

const c = new C()


const findMembers =function(instance,attribute,method){
  
}

console.log(c.validate)

