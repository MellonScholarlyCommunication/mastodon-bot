$(document).ready(function() {
    setTimeout(updateList, 2000);
});

function updateList() {
    $('.List').each( (i,el) => {
        let watchUrl = $(el).attr('data-ref');
        let implementations = [];
        let maxLength = 10;

        if (!watchUrl) {
            return;
        }

        if ($(el).attr('data-implement')) {
            implementations = $(el).attr('data-implement').split(",");
        }

        if ($(el).attr('data-max')) {
            maxLength = parseInt($(el).attr('data-max'));
        }

        let dynamicClass = `${watchUrl}class`.replace(/[^a-zA-Z0-9]+/g,'_').replace(/_+/,'_');

        $.getJSON(watchUrl, (data) => {
            let members = data['contains'].sort(
                function(a,b){ return b.localeCompare(a); }
            );

            members = members.slice(Math.max(members.length - maxLength, 0));

            $(el).empty();

            for (let i = 0 ; i < members.length ; i++) {
                const member = members[i];
                $(el).append(`<li><a href="${member}" class="${dynamicClass}">${member}</a></li>`); 
            }

            if (implementations.includes("toot")) {
                updateTootClick(dynamicClass);
            }
            else if (implementations.includes("en")) {
                updateENClick(dynamicClass);
            }
        }).fail(function(){
            console.log(`Failed to retrieve ${watchUrl}`);
        });
    });

    setTimeout(updateList, 2000);
}

async function updateENClick(className) {
    $(`a.${className}`).click(async function(e) {
        e.preventDefault();
        const href = $(this).attr('href');
        const notification = await $.getJSON(href);
        $(".Details").html(`<pre>${JSON.stringify(notification,null,2)}</pre>`);
    });
}

async function updateTootClick(className) {
    $(`a.${className}`).click(async function(e) {
        e.preventDefault();
        const href = $(this).attr('href');
        const toot = await $.getJSON(href);
        const content = toot['object']['content'].replace(/(<([^>]+)>)/ig, '');
        const published = toot['published'];
        const attributedTo = toot['actor']['id'];
        const urls = toot['object']['url'];

        const references = urls.map( (re) => {
            return `<li><a href=\"${re.href}" class=\"reference">${re.href}</a></li>`;
        }).join("\n");

        let metadata = '<ul>';
        for (let i = 0; i < urls.length ; i++) {
            const met = await getMetdata(urls[i]['href']);
            metadata += `<li class="Metadata">${JSON.stringify(met)}</li>`;
        }

        $(".Details").html(`
            <div class="TootMeta"><tt>${published} - ${attributedTo}</tt></div>
            <div class="TootText">&gt;&gt;{text}</div>
            <div class="TootBody">${content}</div>
            <div class="TootText">&gt;&gt;{references}<ul>${references}</ul></div>
            <div class="TootText">&gt;&gt;{zotero}</div>
            ${metadata}
        `);
                return false;
    });
}

async function getMetdata(url) {
    return new Promise( (resolve) => {
        $.ajax({
            url:         "/service/z/web",
            type:        "POST",
            data:        url,
            contentType: "text/plain",
            dataType:    "json",
            success:     function(result) {
                resolve(result);
            },
            error: function() {
                resolve({'error':'no zotero server available'});
            }
        });
    });
}