function Coord(x,y){
    this.x = x;
    this.y = y;
}

function PlaneGenerator(){

    this.random = ()=>{
        let x,y,rotation;
        x = Math.floor(Math.random()*10);
        y = Math.floor(Math.random()*10);
        rotation = Math.floor(Math.random()*4);
        return {x,y,rotation};
    }
    this.checkPlane = (plane)=>{
        for(let i = 0;i<plane.length;i++)
            if(plane[i].x>9||plane[i].x<0||plane[i].y>9||plane[i].y<0)
                return false;
        return true;
    }
    this.checkPlane2 = (plane2, plane1)=>{
        if(!this.checkPlane(plane2))
            return false;
        let matrix = this.generateMatrix(plane1);
        for(let i = 0;i<plane2.length;i++)
            if(matrix[plane2[i].x][plane2[i].y]!=0)
                return false;
        return true;
    }

    this.createPlane = (x,y,rotation)=>{
        let plane = [];
    switch(rotation){
        case 0:
            plane.push(new Coord(x,y));
            plane.push(new Coord(x+1,y+1));
            plane.push(new Coord(x,y+1));
            plane.push(new Coord(x-1,y+1));
            plane.push(new Coord(x,y+2));
            plane.push(new Coord(x+1,y+3));
            plane.push(new Coord(x,y+3));
            plane.push(new Coord(x-1,y+3));
            break;
        case 1:
            plane.push(new Coord(x,y));
            plane.push(new Coord(x-1,y-1));
            plane.push(new Coord(x-1,y))
            plane.push(new Coord(x-1,y+1));
            plane.push(new Coord(x-2,y));
            plane.push(new Coord(x-3,y-1));
            plane.push(new Coord(x-3,y));
            plane.push(new Coord(x-3,y+1));
            break;
        case 2:
            plane.push(new Coord(x,y));
            plane.push(new Coord(x-1,y-1));
            plane.push(new Coord(x,y-1));
            plane.push(new Coord(x+1,y-1));
            plane.push(new Coord(x,y-2));
            plane.push(new Coord(x-1,y-3));
            plane.push(new Coord(x,y-3));
            plane.push(new Coord(x+1,y-3));
            break;
        case 3:
            plane.push(new Coord(x,y));
            plane.push(new Coord(x+1,y-1));
            plane.push(new Coord(x+1,y));
            plane.push(new Coord(x+1,y+1));
            plane.push(new Coord(x+2,y));
            plane.push(new Coord(x+3,y-1));
            plane.push(new Coord(x+3,y));
            plane.push(new Coord(x+3,y+1));
    }
    if(this.checkPlane(plane))
        return plane;
    return null;
    }

    this.createPlane2 = (plane)=>{
        let random = this.random();
        let newPlane = this.createPlane(random.x,random.y,random.rotation);
        while(newPlane==null||!this.checkPlane2(newPlane,plane)){
            random = this.random();
            newPlane = this.createPlane(random.x, random.y, random.rotation);
        }
        return newPlane;
    }

    this.createPlanes = ()=>{
        let random = this.random()
        let plane1 = this.createPlane(random.x,random.y,random.rotation);
        while(plane1==null){
            random = this.random();
            plane1 = this.createPlane(random.x,random.y,random.rotation);
        }
        let plane2 = this.createPlane2(plane1);
        return {plane1, plane2};
    }

    this.generateMatrix = (plane1, plane2)=>{
        let matrix = new Array(10);
        for(let i = 0;i<10;i++){
            matrix[i] = new Array(10);
            for(let j = 0;j<10;j++){
                matrix[i][j]=0;
            }
        }

        for(let i = 0;i<plane1.length;i++){
            matrix[plane1[i].x][plane1[i].y]=1;
            if(plane2)
                matrix[plane2[i].x][plane2[i].y]=1;
        }
        matrix[plane1[0].x][plane1[0].y]=2;
        if(plane2)
            matrix[plane2[0].x][plane2[0].y]=2;

        return matrix;
    }
    
    this.getPlaneFromMatrix = (matrix)=>{
        plane = [];
        for(let i = 0;i<matrix.length;i++){
            for(let j = 0;j<matrix[i].length;j++){
                if(matrix[i][j]==1)
                    plane.push(new Coord(i,j));
                else if(matrix[i][j]==2)
                    plane.unshift(new Coord(i,j));
            }
        }
        return plane;
    }

}


let planeGenerator = new PlaneGenerator();

module.exports = planeGenerator;
