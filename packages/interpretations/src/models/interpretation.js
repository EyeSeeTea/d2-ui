import { apiFetch } from '../util/api';
import Comment from './comment';

const interpretationsFields = [
    'id',
    'user[id,displayName]',
    'created',
    'likes',
    'likedBy[id,displayName]',
    'text',
    'comments[id,text,created,user[id,displayName]]',
];

const baseFields = [
    'id',
    'name',
    'href',
    'user[id,displayName]',
    'displayName',
    'description',
    'created',
    'lastUpdated',
    'access',
    'publicAccess',
    'userGroupAccesses',
    `interpretations[${interpretationsFields.join(',')}]`,
];

export default class Interpretation {
  constructor(parent, attributes) {
    this._parent = parent;
    Object.assign(this, attributes);
    this.comments = (attributes.comments || []).map(commentAttrs => new Comment(this, commentAttrs));
  }

  save() {
    const modelId = this._parent.id;
    const modelName = this._parent.modelDefinition.name;
    const [method, url] = this.id
        ? ['PUT',  `/interpretations/${this.id}`]
        : ['POST', `/interpretations/${modelName}/${modelId}`];
    return apiFetch(url, method, this.text);
  }

  delete() {
    return apiFetch(`/interpretations/${this.id}`, "DELETE", {});
  }

  like(value) {
    return apiFetch(`/interpretations/${this.id}/like`, value ? "POST" : "DELETE", {});
  }
}