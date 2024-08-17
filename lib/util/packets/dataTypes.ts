abstract class CustomNode {
	abstract _type: string;
}

export class Vector2 extends CustomNode {
	_type = 'vector2';

	constructor(readonly x: number, readonly y: number) {
		super();

		this.x = x;
		this.y = y;
	}
}

export class Vector2i extends CustomNode {
	_type = 'vector2i';

	constructor(readonly x: number, readonly y: number) {
		super();

		this.x = x | 0;
		this.y = y | 0;
	}

	toString (){
		
	}
}