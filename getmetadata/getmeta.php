<?php
/**
 * Script to allow for the gathering of external site meta data via ajax call. 
 *  Not designed to be used via the browser.
 *
 *
 *
 * @file
 * @author James Alexander
 * @copyright © 2015 James Ryan Alexander
 * @license MIT at http://opensource.org/licenses/MIT and LICENSE.txt which should be in the root folder of this software
 * @version 1.0 - 2015-09-30
 */


date_default_timezone_set( 'UTC' );

$urlarray = null;
$url = null;
$action = null;

if ( isset( $_POST['action'] ) ) {

	$action = $_POST['action'];

}

if ( isset( $_POST['url'] ) ) {

	$url = $_POST['url'];
	
}

function getPageData( $url ) {
	
	$ch = curl_init( $url );

	curl_setopt( $ch, CURLOPT_HEADER, 0 );
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1 );

	$result = curl_exec( $ch );

	curl_close( $ch );

	return $result;

}

function getMetaTags( $url ) {

	$pagedata = getPageData( $url );

	$page = new DomDocument();
	libxml_use_internal_errors(true);
	$page->loadHTML( $pagedata );

	$metaDom = $page->getelementsbytagname( 'meta' );

	return $metaDom;

}

function getTitle( $url ) {

	$pagedata = getPageData( $url );

	if ( $pagedata ) {

		$page = new DomDocument();
		libxml_use_internal_errors(true);
		$page->loadHTML( $pagedata );

		$titleDom = $page->getelementsbytagname( 'title' );

		if ($titleDom->length > 0) 
		{
			$title = $titleDom->item(0)->textContent;
		}

		// fall back if first tag it finds is null cause... apparently that's a thing occasionally from testing

		if ( $title == null ) {

	        if ( $titleDom->length > 1 ) {

				$title = $titleDom->item(1)->textContent;

			}
		}

		return $title;
	} else {
		return 'no data recieved';
	}

}

function getDescription ( $url, $type = null ) {

	$metaTags = getMetaTags( $url );
	$desc  = null;
	$ogdesc = null;

	for ( $i = 0; $i < $metaTags->length; $i++ ) {

		$metaTag = $metaTags->item($i);
		if ( strtolower( $metaTag->getAttribute('name') ) == 'description' ) {
			$desc = $metaTag->getAttribute('content');
		}

		if ( strtolower( $metaTag->getAttribute('property') ) == 'og:description' ) {
			$ogdesc = $metaTag->getAttribute('content');
		}

	}

	if ( $type = 'og' ) {

		if ( $ogdesc ) {
			return $ogdesc;
		} else {
			return 'no description found';
		}

	} else {

		if ( $desc ) {

			return $desc;

		} else {

			if ( $ogdesc ) {

				return $ogdesc;

			} else {

				return 'no description found';
			}
		}
	}

}


if ( $action ) {


	switch ( $action ) {
		case 'title':

			if ( $url ) {

				$result = getTitle( $url );

				echo json_encode( $result );

			} else {

				echo json_encode( 'no url detected, either check your input or complain to maintainer' );

			}

			break;


		case 'description':

			if ( $url ) {

				$result = getDescription( $url );

				echo json_encode( $result );

			} else {

				echo json_encode( 'no url detected, either check your input or complain to maintainer' );

			}

			break;

		case 'ogdescription':

			if ( $url ) {

				$result = getDescription( $url, 'og' );

				echo json_encode( $result );

			} else {

				echo json_encode( 'no url detected, either check your input or complain to maintainer' );

			}

			break;

		case 'multi':


		default:
		echo json_encode( "not title?" );
			break;
	} 

} 

/* 
//For testing
else {
	echo getTitle( "http://php.net/manual/en/class.domnodelist.php" );
}
*/