import instaloader
import os

L = instaloader.Instaloader(
    download_videos=False, 
    save_metadata=False, 
    post_metadata_txt_pattern='{caption}',
    download_comments=False,
    download_geotags=False,
    dirname_pattern='web/public/instagram'
)

profile_name = "picknwear22"

print(f"Fetching profile {profile_name}...")
try:
    profile = instaloader.Profile.from_username(L.context, profile_name)
    print("Found profile. Fetching posts...")
    
    count = 0
    for post in profile.get_posts():
        if count >= 8: # Get the latest 8 posts
            break
        print(f"Downloading post {count+1}...")
        L.download_post(post, target='web/public/instagram')
        count += 1
except Exception as e:
    print("Error:", e)
