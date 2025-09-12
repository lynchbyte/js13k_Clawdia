import * as THREE from "three"



export function createText(message, font) {

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', {
        willReadFrequently: true
    });
    let metrics = null;
    const textHeight = 100;
    context.font = 'normal ' + textHeight + 'px ' + font;
    metrics = context.measureText(message);
    const textWidth = metrics.width;
    canvas.width = textWidth;
    canvas.height = textHeight;
    canvas.border = '10px solid blue';

    context.font = 'normal ' + textHeight * 0.75 + 'px ' + font//0.75 for emojis wierdness

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, textWidth / 2, textHeight / 2);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.MeshStandardMaterial({

        map: texture,
        transparent: true

    });

    const geometry = new THREE.PlaneGeometry((0.125 * textWidth) / textHeight, 0.125);

    const plane = new THREE.Mesh(geometry, material);

    return plane


}



export function updateText(textMesh, newString) {

    const texture = textMesh.material.map

    const canvas = textMesh.material.map.image

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(newString, canvas.width / 2, canvas.height / 2);

    texture.needsUpdate = true;

}


export function gradientMateriail(colbtm, coltop) {

   const material = new THREE.ShaderMaterial({

        uniforms: {
            color1: { value: new THREE.Color(colbtm) },
            color2: { value: new THREE.Color(coltop) }
        },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 color1; uniform vec3 color2; varying vec2 vUv; void main() { gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0); }`
    });

    return material;

}


export function addArrow(){
  const s=new THREE.Shape().moveTo(-2,16).lineTo(-8,14).lineTo(0,26).lineTo(8,14).lineTo(2,16).lineTo(2,0).lineTo(-2,0).lineTo(-2,16);
  const g=new THREE.ExtrudeGeometry(s,{depth:.1});g.center();return g;
}






export function removeComponents(obParent, name, obArray) {

    const childrenToRemove = [];

    for (let i = 0; i < obParent.children.length; i++) {

        const child = obParent.children[i];

        if (child.name === name) {

            childrenToRemove.push(child);

        }
    }

    for (const childToRemove of childrenToRemove) {

        obParent.remove(childToRemove);

    }

    obArray.length = 0;

}


