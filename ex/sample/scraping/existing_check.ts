import {check_existing_by_slug} from "../../crawler/functions.js";

check_existing_by_slug('WXDi-P10-060P').then((exists: boolean) => {
    console.log(exists ? 'exists' : 'not exists');
});
