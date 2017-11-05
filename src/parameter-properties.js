const DECORATOR = 'paramProperties';

class ParameterProperties {
    constructor(types) {
        /** @type {babel.types} */
        this.types = types;
    }

    /**
     * Transform the given ClassDeclaration `node`, if properly decorated.
     *
     * @param {babel.types.ClassDeclaration} node ClassDeclaration node.
     */
    transform(node) {
        const decorator = this.getDecorator(node);
        if (!decorator) {
            return;
        }

        this.undecorate(node);

        const ctor = this.getConstructor(node);
        for (const param of ctor.params) {
            const assignement = this.getAssignmentStatement(param);
            ctor.body.body.unshift(assignement);
        }
    }

    /**
     * Look for the expected decorator and return it (if declared).
     *
     * @param {babel.types.ClassDeclaration} node ClassDeclaration node.
     *
     * @return {babel.types.Decorator} The plugin-specific decorator.
     */
    getDecorator(node) {
        return (node.decorators || []).find(decorator => {
            return decorator.expression.name === DECORATOR;
        });
    }

    /**
     * Remove paramProperties decorators from the class
     * declaration.
     *
     * @param {babel.types.ClassDeclaration} node
     */
    undecorate(node) {
        node.decorators = node.decorators.filter(d => {
            d.expression && d.expression.name !== DECORATOR;
        });
    }

    /**
     * Get the constructor of `node`.
     *
     * @param {babel.types.ClassDeclaration} node ClassDeclaration node.
     *
     * @return {babel.types.ClassMethod} `node` constructor.
     */
    getConstructor(node) {
        const classBody = node.body;
        return classBody.body.find(subNode => {
            return subNode.type === 'ClassMethod' && subNode.kind === 'constructor';
        });
    }

    /**
     * Get an expression statement of assignement (to set the given
     * parameter as a property of the decorated class instance).
     *
     * @param {babel.types.Identifier} param Constructor parameter.
     *
     * @return {babel.types.ExpressionStatement}
     */
    getAssignmentStatement(param) {
        const instance = this.getThisIdentifier();
        const newProp = this.buildMember(instance, param);
        const assignExpression = this.buildAssignment(newProp, param);
        return this.buildStatement(assignExpression);
    }

    /**
     * @return {babel.types.Identifier}
     */
    getThisIdentifier() {
        return this.types.identifier('this');
    }

    /**
     * @param {babel.types.Expression} object
     * @param {babel.types.Expression} prop
     *
     * @return {babel.types.MemberExpression}
     */
    buildMember(object, prop) {
        return this.types.memberExpression(object, prop);
    }

    /**
     * @param {babel.types.LVal} left
     * @param {babel.types.Expression} right
     *
     * @return {babel.types.AssignmentExpression}
     */
    buildAssignment(left, right) {
        return this.types.assignmentExpression('=', left, right);
    }

    /**
     * @param {babel.types.Expression} expression
     *
     * @return {babel.types.ExpressionStatement}
     */
    buildStatement(expression) {
        return this.types.expressionStatement(expression);
    }
}

export default ParameterProperties;