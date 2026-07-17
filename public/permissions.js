window.can = function(permission){

    // Temporary compatibility for old admin accounts
    if(!window.permissions || Object.keys(window.permissions).length === 0){
        return true;
    }

    return !!window.permissions[permission];

};