export function RenderAfter() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const retVal = descriptor.value.apply(this, arguments);
        this.tsgo.Render();
    }
}
