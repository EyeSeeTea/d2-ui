import { apiFetch } from '../util/api';
import { keyBy, filter, map, flatMap, flow, groupBy, without } from 'lodash/fp';
import { orderBy, concat, toPairs, at, differenceBy } from 'lodash/fp';

export async function getMentions(d2) {
    const allUsersCollection = await d2.models.users.list({
        fields: "id,displayName,userCredentials[username]",
        order: "displayName:asc",
        paging: false,
    });

    const interpretationsResponse = await apiFetch("/interpretations", "GET", {
        fields: "id,mentions",
        filter: [`user.id:eq:${d2.currentUser.id}`, "mentions:!null"],
        paging: false,
    });

    const commentsResponse = await apiFetch("/interpretations", "GET", {
        fields: "id,comments[mentions]",
        filter: [`comments.user.id:eq:${d2.currentUser.id}`, "comments.mentions.username:!null"],
        paging: false,
    });

    const allUsers = allUsersCollection.toArray().map(user => ({
        id: user.id,
        displayName: user.displayName,
        username: user.userCredentials.username,
    }));

    const allUsersByUsername = keyBy("username", allUsers);

    const interpretationMentions = flatMap(
        interpretation => map("username", interpretation.mentions),
        interpretationsResponse.interpretations);

    const commentMentions = flatMap(
        interpretation => map("username", flatMap("mentions", interpretation.comments)),
        commentsResponse.interpretations);

    const sortByFrequency = flow(
        groupBy(value => value),
        toPairs,
        map(([value, group]) => ({value, count: group.length})),
        orderBy(["count", "value"], ["desc", "asc"]),
        map("value"),
    );

    const mostMentionedUsernames = flow(
        concat(commentMentions),
        without([d2.currentUser.username]),
        sortByFrequency,
    )(interpretationMentions);

    const mostMentionedUsers = at(mostMentionedUsernames, allUsersByUsername);

    const allUsersFiltered = differenceBy("id", allUsers, mostMentionedUsers)
        .filter(user => d2.currentUser.username !== user.username);

    return {allUsers: allUsersFiltered, mostMentionedUsers};
}