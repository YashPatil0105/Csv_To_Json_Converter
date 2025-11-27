// here we will convert flat object with keys like "a.b.c" into nested objects.

function flatToNested(flatRecord){
    const nested = {};

    for( const [key, value] of Object.entries(flatRecord) ){
        if( !key )continue;
        const parts = key.split('.');
        let curr = nested;

        for(let i = 0; i < parts.length; i++){
            const part = parts[i];

            if( i === parts.length - 1){
                curr[part] = value;
            }else{
                if( !curr[part] || typeof curr[part] !== 'object' ){
                    curr[part] = {};
                }
                curr = curr[part];
            }
        }
    }

    return nested;
}

module.exports = { flatToNested };