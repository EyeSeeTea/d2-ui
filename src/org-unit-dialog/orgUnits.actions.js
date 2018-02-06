import Action from '../action/Action';
import orgUnitsStore from './orgUnits.store';
import { getInstance as getD2 } from 'd2/lib/d2';
import { getOwnedPropertyJSON } from 'd2/lib/model/helpers/json';

const actions = Action.createActionsFromNames([
    'load',
    'selectionChanged',
    'save',
]);

actions.load.subscribe(({data: objects, complete, error}) => {
    return getD2()
        .then(d2 => {
            const objectType = objects[0].modelDefinition.name;
            return d2.models[objectType].list({
                paging: false,
                filter: `id:in:[${objects.map(obj => obj.id)}]`,
                fields: "*,organisationUnits[*]"
            }).then(collection => collection.toArray());
        })
        .then(objectsWithOrgUnitsInfo => {
            orgUnitsStore.setState({objects: objectsWithOrgUnitsInfo});
        })
        .then(complete)
        .catch(error);
});

actions.selectionChanged.subscribe(({data: {orgUnits, strategy}}) => {
    const {objects} = orgUnitsStore.getState();
    const orgUnitsAssignedToAllObjects =
        _.intersectionBy(...objects.map(obj => obj.organisationUnits.toArray()), "id");
    const changeSelection = (object) => {
        switch(strategy) {
            case "merge":
                const objectPrevOrgUnits = object.organisationUnits.toArray();
                const objectNewOrgUnits = _(objectPrevOrgUnits)
                    .differenceBy(orgUnitsAssignedToAllObjects, "id")
                    .unionBy(orgUnits.toArray(), "id")
                    .value();
                const toRemove = _(objectPrevOrgUnits).differenceBy(objectNewOrgUnits, "id").value();
                const toAdd = _(objectNewOrgUnits).differenceBy(objectPrevOrgUnits, "id").value();
                _(toRemove).each(ou => object.organisationUnits.remove(ou));
                _(toAdd).each(ou => object.organisationUnits.add(ou));
                return object;
            case "replace":
                object.organisationUnits = orgUnits;
                return object;
            default:
                throw new Error("Unknown strategy: " + strategy);
        }
    };
    const newObjects = objects.map(changeSelection);
    orgUnitsStore.setState({objects: newObjects});
});

actions.save.subscribe(action => {
    return getD2().then(d2 => {
        const api = d2.Api.getApi();
        const {objects} = orgUnitsStore.getState();

        const objectsPayload = objects.map(obj =>
            _.assign({}, getOwnedPropertyJSON(obj), {
                organisationUnits: obj.organisationUnits.toArray().map(ou => ({id: ou.id}))
            }));
        const objectPluralType = objects[0].modelDefinition.plural;
        const payload = {[objectPluralType]: objectsPayload};

        return api.post('metadata?strategy=UPDATE&mergeMode=MERGE', payload)
            .then((res) => {
                if (res.status === 'OK')
                    action.complete();
                else
                    action.error(JSON.stringify(res));
            })
            .catch(({message}) => {
                action.error(message);
            });
    });
});

export default actions;
