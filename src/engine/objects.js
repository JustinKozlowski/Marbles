

class Location {
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
}


class Vector {
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
}

class Marble {
  constructor (loc, speed, id){
    this.id = id
    this.loc = loc;
    this.speed = speed;
  }

}

class Round {
  constructor(marbles){
    this.marbles = marbles;
  }
}

class Obstacle {
  constructor(shape){
    this.shape = shape;
  }
}

class Object {}

class Circle extends Object {
  constructor(radius){}
}

