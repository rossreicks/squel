import { _clone, _extend } from './helpers';

export class Cloneable {
    /**
     * Clone this builder
     */
    clone() {
        const newInstance = new (this.constructor as any)();

        return _extend(newInstance, _clone(_extend({} as any, this)));
    }
}
