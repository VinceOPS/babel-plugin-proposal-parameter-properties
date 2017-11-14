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
        this.insertAssignments(ctor);
    }

    /**
     * Look for the expected decorator and return it (if declared).
     *
     * @param {babel.types.ClassDeclaration} node ClassDeclaration node.
     *
     * @return {babel.types.Decorator} The plugin-specific decorator (or `undefined`).
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
     * @param {babel.types.ClassDeclaration} node Node decorated with 'paramProperties'.
     */
    undecorate(node) {
        node.decorators = node.decorators.filter(d => {
            return d.expression && d.expression.name !== DECORATOR;
        });
    }

    /**
     * Get the constructor of the `node` class.
     *
     * @param {babel.types.ClassDeclaration} node ClassDeclaration node.
     *
     * @return {babel.types.ClassMethod} `node` class constructor.
     */
    getConstructor(node) {
        const classBody = node.body;

        return classBody.body.find(subNode => {
            return this.types.isClassMethod(subNode) && subNode.kind === 'constructor';
        });
    }

    /**
     * Insert the parameter properties assignments in the constructor body.
     * If a call to `super` is found, append the statements just after it,
     * otherwise, "prepend" the statements.
     *
     * @param {babel.types.ClassMethod} ctor Class constructor.
     */
    insertAssignments(ctor) {
        const ctorBody = ctor.body.body;
        const superIndex = ctorBody.findIndex(n =>
            this.types.isExpressionStatement(n) &&
            this.types.isCallExpression(n.expression) &&
            this.types.isSuper(n.expression.callee)
        );

        ctor.params.forEach((param, i) => {
            const assignment = this.getAssignmentStatement(param);
            const index = superIndex + 1 + i;
            ctorBody.splice(index, 0, assignment);
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