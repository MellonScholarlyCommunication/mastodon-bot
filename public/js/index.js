$(document).ready(function() {
    setTimeout(updateList, 2000);
});

function updateList() {
    $.getJSON("accepted/", (data) => {
        const members = data['contains'].sort(
            function(a,b){ return b.localeCompare(a); }
        );

        $('.List').empty();

        for (let i = 0 ; i < members.length ; i++) {
            const member = members[i];
            $('.List').append(`<li><a href="${member}" class="toot">${member}</a></li>`); 
        }

        $("a.toot").click(async function(e) {
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
    }).fail(function(){
        console.log("Failed to retrieve /accepted/");
    });
    setTimeout(updateList, 2000);
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