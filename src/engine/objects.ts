class Vector {
  x: number;
  y: number;


  constructor(x: number, y: number){
    this.x = x;
    this.y = y;
  }
}

class Shape{}

class AABB extends Shape {
  min: Vector;
  max: Vector;

  constructor(vec1: Vector, vec2: Vector){
    super();
    this.min = vec1;
    this.max = vec2;
  }
}

class Circle extends Shape {
  radius: number;
  position: Vector;

  constructor(radius: number, position: Vector){
    super();
    this.radius = radius;
    this.position = position;
  }
}


// This section is collision logic
function AABBvsAABB(a: AABB, b: AABB): boolean {
  // Exit with no intersection if found separated along an axis
  if(a.max.x < b.min.x || a.min.x > b.max.x) return false
  if(a.max.y < b.min.y || a.min.y > b.max.y) return false
 
  // No separating axis found, therefor there is at least one overlapping axis
  return true
}



function Distance(a: Vector, b: Vector): number {
  return Math.sqrt( (a.x - b.x)^2 + (a.y - b.y)^2 );
}
 
// optimized distance formula for circle collision detection
function CirclevsCircleOptimized(a: Circle, b: Circle): boolean {
  var r: number = a.radius + b.radius;
  r *= r;
  return r < ((a.position.x + b.position.x)^2 + (a.position.y + b.position.y)^2)
}

class Body {
  shape: Shape;
  // Transform tx;
  // Material material;
  // MassData mass_data;
  position: Vector;
  mass: number;
  inv_mass: number;
  restitution: number;
  velocity: Vector;
  force: Vector;
  gravityScale: number; // maybe this is a vector so gravity in different directions?
};

function AddVectors(A: Vector, B: Vector): Vector {
  return new Vector((A.x + B.x), (A.y + B.y))
}

function SubtractVectors(A: Vector, B: Vector): Vector {
  return new Vector((A.x - B.x), (A.y - B.y))
}

function DotProduct(A: Vector, B: Vector): number {
  return A.x * B.x + A.y * B.y
}

function ScaleVector(Vec: Vector, scale: number): Vector {
  return new Vector(Vec.x*scale, Vec.y*scale)
}

//
function ResolveCollision(A: Body, B: Body, normal: Vector): void {
  // Calculate relative velocity
  var rv: Vector = SubtractVectors(B.velocity, A.velocity)
 
  // Calculate relative velocity in terms of the normal direction
  var velAlongNormal: number = DotProduct( rv, normal )
 
  // Do not resolve if velocities are separating
  if(velAlongNormal > 0)
    return;
 
  // Calculate restitution
  var e: number = Math.min( A.restitution, B.restitution)
 
  // Calculate impulse scalar
  var j: number= -(1 + e) * velAlongNormal
  j /= A.inv_mass + B.inv_mass
 
  // Apply impulse
  var impulse: Vector = ScaleVector(normal, j)
  A.velocity = SubtractVectors(A.velocity, ScaleVector(impulse, 1 / A.mass))
  B.velocity = AddVectors(B.velocity, ScaleVector(impulse, 1 / B.mass))
}

function PositionalCorrection(A: Body, B: Body, normal: Vector, penetration: number)
{
  const percent: number = 0.2 // usually 20% to 80%
  const slop: number = 0.01 // usually 0.01 to 0.1
  // get penetration from manifoold?sae with normal?
  var scale: number = Math.max(penetration - slop, 0) / (A.inv_mass + B.inv_mass) * percent
  var correction: Vector =  ScaleVector(normal, scale)
  A.position = SubtractVectors(A.position, ScaleVector(correction, A.inv_mass))
  B.position = AddVectors(B.position, ScaleVector(correction, B.inv_mass))
}

class Manifold {
  A: Body;
  B: Body;
  penetration: number;
  normal: number;
}

function CirclevsCircle(m: Manifold): boolean {
  // Setup a couple pointers to each object
  var A: Circle = m.A.shape;
  var B: Circle = m.B.shape;
 
  // Vector from A to B
  var n: Vector = SubtractVectors(B.position, A.position)
 
  var r: number = A.radius + B->radius
  r *= r
 
  if(n.LengthSquared( ) > r)
    return false
 
  // Circles have collided, now compute manifold
  float d = n.Length( ) // perform actual sqrt
 
  // If distance between circles is not zero
  if(d != 0)
  {
    // Distance is difference between radius and distance
    m->penetration = r - d
 
    // Utilize our d since we performed sqrt on it already within Length( )
    // Points from A to B, and is a unit vector
    c->normal = t / d
    return true
  }
 
  // Circles are on same position
  else
  {
    // Choose random (but consistent) values
    c->penetration = A->radius
    c->normal = Vec( 1, 0 )
    return true
  }
}

bool AABBvsAABB( Manifold *m )
{
  // Setup a couple pointers to each object
  Object *A = m->A
  Object *B = m->B
  
  // Vector from A to B
  Vec2 n = B->pos - A->pos
  
  AABB abox = A->aabb
  AABB bbox = B->aabb
  
  // Calculate half extents along x axis for each object
  float a_extent = (abox.max.x - abox.min.x) / 2
  float b_extent = (bbox.max.x - bbox.min.x) / 2
  
  // Calculate overlap on x axis
  float x_overlap = a_extent + b_extent - abs( n.x )
  
  // SAT test on x axis
  if(x_overlap > 0)
  {
    // Calculate half extents along x axis for each object
    float a_extent = (abox.max.y - abox.min.y) / 2
    float b_extent = (bbox.max.y - bbox.min.y) / 2
  
    // Calculate overlap on y axis
    float y_overlap = a_extent + b_extent - abs( n.y )
  
    // SAT test on y axis
    if(y_overlap > 0)
    {
      // Find out which axis is axis of least penetration
      if(x_overlap > y_overlap)
      {
        // Point towards B knowing that n points from A to B
        if(n.x < 0)
          m->normal = Vec2( -1, 0 )
        else
          m->normal = Vec2( 0, 0 )
        m->penetration = x_overlap
        return true
      }
      else
      {
        // Point toward B knowing that n points from A to B
        if(n.y < 0)
          m->normal = Vec2( 0, -1 )
        else
          m->normal = Vec2( 0, 1 )
        m->penetration = y_overlap
        return true
      }
    }
  }
}

bool AABBvsCircle( Manifold *m )
{
  // Setup a couple pointers to each object
  Object *A = m->A
  Object *B = m->B
 
  // Vector from A to B
  Vec2 n = B->pos - A->pos
 
  // Closest point on A to center of B
  Vec2 closest = n
 
  // Calculate half extents along each axis
  float x_extent = (A->aabb.max.x - A->aabb.min.x) / 2
  float y_extent = (A->aabb.max.y - A->aabb.min.y) / 2
 
  // Clamp point to edges of the AABB
  closest.x = Clamp( -x_extent, x_extent, closest.x )
  closest.y = Clamp( -y_extent, y_extent, closest.y )
 
  bool inside = false
 
  // Circle is inside the AABB, so we need to clamp the circle's center
  // to the closest edge
  if(n == closest)
  {
    inside = true
 
    // Find closest axis
    if(abs( n.x ) > abs( n.y ))
    {
      // Clamp to closest extent
      if(closest.x > 0)
        closest.x = x_extent
      else
        closest.x = -x_extent
    }
 
    // y axis is shorter
    else
    {
      // Clamp to closest extent
      if(closest.y > 0)
        closest.y = y_extent
      else
        closest.y = -y_extent
    }
  }
 
  Vec2 normal = n - closest
  real d = normal.LengthSquared( )
  real r = B->radius
 
  // Early out of the radius is shorter than distance to closest point and
  // Circle not inside the AABB
  if(d > r * r && !inside)
    return false
 
  // Avoided sqrt until we needed
  d = sqrt( d )
 
  // Collision normal needs to be flipped to point outside if circle was
  // inside the AABB
  if(inside)
  {
    m->normal = -n
    m->penetration = r - d
  }
  else
  {
    m->normal = n
    m->penetration = r - d
  }
 
  return true
}

