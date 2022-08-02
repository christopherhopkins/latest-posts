import { __ } from '@wordpress/i18n';
import { 
    useBlockProps,
    InspectorControls
} from '@wordpress/block-editor';
import { 
    PanelBody,
    ToggleControl, 
    QueryControls,
    Spinner
} from "@wordpress/components";
import { useSelect } from '@wordpress/data';
import { RawHTML } from "@wordpress/element";
import { format, dateI18n, __experimentalGetSettings as getSettings } from "@wordpress/date";
import './editor.scss';
export default function Edit({attributes, setAttributes}) {
    const { 
        numberOfPosts,
        displayFeaturedImage,
        taxonomy,
        term,
        order,
        orderBy
    } = attributes;

    const posts = useSelect(
        (select) => {
            const { getEntityRecords } = select('core');
            const postType = "post";
            const taxtax = taxonomy;
            const taxterm = term;
            const args = {
                per_page: numberOfPosts,
                order: order,
                orderby: orderBy,
                _embed: true,
                status: "publish",
                tax_relation: "AND",
            };
            if( taxtax ) {
                args[`${taxtax}`] = taxterm;
            }
            console.log(args);
            return getEntityRecords(
                'postType',
                postType,
                args
            );
        },
        [numberOfPosts, order, orderBy, taxonomy, term] // so this reruns if number of posts option changes
    );
    console.log(posts);
    const allTaxonomies = useSelect(
        (select) => {
            let returnArray = [];
            const taxonomies = select('core').getTaxonomies();
            if( taxonomies ) {
                for(var tax of taxonomies) {
                    let terms = select('core').getEntityRecords('taxonomy', tax.slug, {per_page: -1});
                    if( terms ) {
                        for(var term of terms) {
                            returnArray.push(term);
                        }
                    }
                }
            }
            return returnArray;
        }, []
    );
    const onChangeDisplayFeaturedImage = () => {
        setAttributes( { displayFeaturedImage: !displayFeaturedImage } );
    }
    const onChangeNumberOfPosts = (value) => {
        setAttributes( { numberOfPosts: value } );
    }
    const onChangeOrderBy = (value) => {
        setAttributes( { orderBy: value } );
    }
    const onChangeOrder = (value) => {
        setAttributes( { order: value } );
    }
    const onChangeCategory = (value) => {
        if( allTaxonomies ) {
            console.log(allTaxonomies.find((tax) => tax.id == value));
            setAttributes({ taxonomy: allTaxonomies.find((tax) => tax.id == value).taxonomy });
        }
        setAttributes( { term: value } );
    }
    const placeholderHTML = [];
    for(var i = 0; i < numberOfPosts; i++) {
        placeholderHTML.push(i);
    }
    return (
        <>
            <InspectorControls>
                <PanelBody title={__( "Query Settings" , "chopkins-latest-posts" )}>
                    {!allTaxonomies || allTaxonomies.length <= 0 && 
                        <Spinner />
                    }
                    {allTaxonomies && allTaxonomies.length > 0 && 
                        <QueryControls 
                            minItems={1}
                            maxItems={12}
                            numberOfItems={numberOfPosts}
                            order={order}
                            orderBy={orderBy}
                            categoriesList={allTaxonomies}
                            selectedCategoryId={term}
                            onCategoryChange={onChangeCategory}
                            onNumberOfItemsChange={onChangeNumberOfPosts}
                            onOrderByChange={onChangeOrderBy}
                            onOrderChange={onChangeOrder}
                        />
                    }
                </PanelBody>
                <PanelBody title={__( "Image Settings" , "chopkins-latest-posts" )}>
                    <ToggleControl
                        label={__( "Display Featured Images", "chopkins-latest-posts" )}
                        checked={displayFeaturedImage}
                        onChange={onChangeDisplayFeaturedImage}
                    />
                </PanelBody>
            </InspectorControls>
            <ul { ...useBlockProps() }>
                {!posts && numberOfPosts && placeholderHTML.map( (place) => {
                    return (
                        <li key={place}><Spinner /></li>
                    );
                } )}
                {posts && posts.map( (post) => {
                    const title = post.title.rendered ?? __( "No Post Title", "chopkins-latest-posts" );
                    const permalink = "#"; // don't want these click-able from the editor
                    const excerpt = post.excerpt.rendered;
                    const date =  dateI18n( getSettings().formats.date, post.date_gmt );
                    const datetime = format("c", post.date_gmt);
                    const featuredImage = 
                        post._embedded && 
                        post._embedded["wp:featuredmedia"] && 
                        post._embedded["wp:featuredmedia"].length > 0 && 
                        post._embedded["wp:featuredmedia"][0] ?
                        post._embedded["wp:featuredmedia"][0] : 
                        false;
                    return(
                        <li key={post.id}>
                            {displayFeaturedImage && featuredImage && 
                                <img 
                                    src={featuredImage.media_details.sizes.full.source_url} 
                                    alt={featuredImage.alt_text}
                                />
                            }
                            {title && 
                                <a href={permalink}>
                                    <h3><RawHTML>{__(title, "chopkins-latest-posts")}</RawHTML></h3>
                                </a>
                            }
                            <time datetime={datetime}>{date}</time>
                            {excerpt && <RawHTML>{__(excerpt, "chopkins-latest-posts")}</RawHTML>}
                            {/* {displayFeaturedImage &&  } */}
                        </li>
                    );
                } )}
            </ul>
        </>
    );
}