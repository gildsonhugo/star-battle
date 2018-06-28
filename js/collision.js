function collide(s1, s2){
    let hit = false;

    let vetX = s1.centerX() - s2.centerX();
    let vetY = s1.centerY() - s2.centerY();

    let sumHalfWidth = s1.halfWidth() + s2.halfWidth();
    let sumHalfHeight = s1.halfHeight() + s2.halfHeight();

    if(Math.abs(vetX) <= sumHalfWidth && Math.abs(vetY) <= sumHalfHeight){
        hit = true;
    }

    return hit;
}