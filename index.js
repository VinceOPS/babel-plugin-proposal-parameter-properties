import ParameterProperties from './src/parameter-properties';

const plugin = ({ types: t }) => {
    const paramProps = new ParameterProperties(t);

    return {
        visitor: {
            ClassDeclaration(path) {
                const {node} = path;
                paramProps.transform(node);
            }
        }
    };
};

export default plugin;
