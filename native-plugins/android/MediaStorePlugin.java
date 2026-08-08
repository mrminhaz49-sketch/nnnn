package com.neogallery.app;

import android.Manifest;
import android.content.ContentUris;
import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Size;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.File;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@CapacitorPlugin(
    name = "MediaStorePlugin",
    permissions = {
        @Permission(
            strings = { Manifest.permission.READ_MEDIA_IMAGES, Manifest.permission.READ_MEDIA_VIDEO },
            alias = "media"
        ),
        @Permission(
            strings = { Manifest.permission.READ_EXTERNAL_STORAGE },
            alias = "storage"
        )
    }
)
public class MediaStorePlugin extends Plugin {

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject result = new JSObject();
        boolean granted = hasMediaPermission();
        result.put("granted", granted);
        result.put("permissionState", granted ? "granted" : "prompt");
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (hasMediaPermission()) {
            JSObject result = new JSObject();
            result.put("granted", true);
            result.put("permissionState", "granted");
            call.resolve(result);
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissionForAlias("media", call, "permissionsCallback");
        } else {
            requestPermissionForAlias("storage", call, "permissionsCallback");
        }
    }

    @com.getcapacitor.annotation.PermissionCallback
    private void permissionsCallback(PluginCall call) {
        JSObject result = new JSObject();
        boolean granted = hasMediaPermission();
        result.put("granted", granted);
        result.put("permissionState", granted ? "granted" : "denied");
        call.resolve(result);
    }

    private boolean hasMediaPermission() {
        Context ctx = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return ctx.checkSelfPermission(Manifest.permission.READ_MEDIA_IMAGES) == android.content.pm.PackageManager.PERMISSION_GRANTED
                && ctx.checkSelfPermission(Manifest.permission.READ_MEDIA_VIDEO) == android.content.pm.PackageManager.PERMISSION_GRANTED;
        } else {
            return ctx.checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE) == android.content.pm.PackageManager.PERMISSION_GRANTED;
        }
    }

    @PluginMethod
    public void getAlbums(PluginCall call) {
        if (!hasMediaPermission()) {
            call.reject("Permission not granted");
            return;
        }

        Context context = getContext();
        Uri uri = MediaStore.Files.getContentUri("external");
        String[] projection = new String[] {
            MediaStore.Files.FileColumns.BUCKET_ID,
            MediaStore.Files.FileColumns.BUCKET_DISPLAY_NAME,
            MediaStore.Files.FileColumns._ID,
            MediaStore.Files.FileColumns.MEDIA_TYPE
        };

        String selection = MediaStore.Files.FileColumns.MEDIA_TYPE + "="
            + MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE
            + " OR " + MediaStore.Files.FileColumns.MEDIA_TYPE + "="
            + MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO;

        String sortOrder = MediaStore.Files.FileColumns.DATE_MODIFIED + " DESC";

        Map<String, AlbumHolder> albumMap = new HashMap<>();

        try (Cursor cursor = context.getContentResolver().query(uri, projection, selection, null, sortOrder)) {
            if (cursor != null) {
                int bucketIdIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.BUCKET_ID);
                int bucketNameIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.BUCKET_DISPLAY_NAME);
                int idIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns._ID);
                int mediaTypeIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.MEDIA_TYPE);

                while (cursor.moveToNext()) {
                    String bucketId = cursor.getString(bucketIdIdx);
                    String bucketName = cursor.getString(bucketNameIdx);
                    long id = cursor.getLong(idIdx);
                    int mediaType = cursor.getInt(mediaTypeIdx);

                    if (bucketId == null) bucketId = "default";
                    if (bucketName == null) bucketName = "Camera";

                    Uri contentUri = mediaType == MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO
                        ? ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, id)
                        : ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id);

                    String coverThumbPath = getOrCreateThumbnailPath(id, contentUri, mediaType);

                    if (!albumMap.containsKey(bucketId)) {
                        AlbumHolder holder = new AlbumHolder();
                        holder.id = bucketId;
                        holder.name = bucketName;
                        holder.count = 1;
                        holder.coverUri = coverThumbPath;
                        albumMap.put(bucketId, holder);
                    } else {
                        AlbumHolder holder = albumMap.get(bucketId);
                        holder.count++;
                    }
                }
            }
        } catch (Exception e) {
            call.reject("Error querying albums: " + e.getMessage());
            return;
        }

        JSArray albumsArray = new JSArray();
        for (AlbumHolder holder : albumMap.values()) {
            JSObject alb = new JSObject();
            alb.put("id", holder.id);
            alb.put("name", holder.name);
            alb.put("count", holder.count);
            alb.put("coverUri", holder.coverUri);
            albumsArray.put(alb);
        }

        JSObject res = new JSObject();
        res.put("albums", albumsArray);
        call.resolve(res);
    }

    @PluginMethod
    public void getMedia(PluginCall call) {
        if (!hasMediaPermission()) {
            call.reject("Permission not granted");
            return;
        }

        String targetBucketId = call.getString("bucketId", null);
        int offset = call.getInt("offset", 0);
        int limit = call.getInt("limit", 1000);

        Context context = getContext();
        Uri uri = MediaStore.Files.getContentUri("external");

        String[] projection = new String[] {
            MediaStore.Files.FileColumns._ID,
            MediaStore.Files.FileColumns.DISPLAY_NAME,
            MediaStore.Files.FileColumns.MEDIA_TYPE,
            MediaStore.Files.FileColumns.MIME_TYPE,
            MediaStore.Files.FileColumns.SIZE,
            MediaStore.Files.FileColumns.DATE_MODIFIED,
            MediaStore.Files.FileColumns.BUCKET_DISPLAY_NAME,
            MediaStore.Files.FileColumns.BUCKET_ID,
            MediaStore.Files.FileColumns.WIDTH,
            MediaStore.Files.FileColumns.HEIGHT,
            MediaStore.Video.VideoColumns.DURATION,
            MediaStore.Files.FileColumns.DATA
        };

        String selection = "(" + MediaStore.Files.FileColumns.MEDIA_TYPE + "="
            + MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE
            + " OR " + MediaStore.Files.FileColumns.MEDIA_TYPE + "="
            + MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO + ")";

        if (targetBucketId != null && !targetBucketId.isEmpty()) {
            selection += " AND " + MediaStore.Files.FileColumns.BUCKET_ID + "='" + targetBucketId + "'";
        }

        String sortOrder = MediaStore.Files.FileColumns.DATE_MODIFIED + " DESC LIMIT " + limit + " OFFSET " + offset;

        JSArray itemsArray = new JSArray();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.US);

        try (Cursor cursor = context.getContentResolver().query(uri, projection, selection, null, sortOrder)) {
            if (cursor != null) {
                int idIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns._ID);
                int nameIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.DISPLAY_NAME);
                int mediaTypeIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.MEDIA_TYPE);
                int mimeIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.MIME_TYPE);
                int sizeIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.SIZE);
                int dateIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.DATE_MODIFIED);
                int bucketNameIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.BUCKET_DISPLAY_NAME);
                int widthIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.WIDTH);
                int heightIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.HEIGHT);
                int durationIdx = cursor.getColumnIndex(MediaStore.Video.VideoColumns.DURATION);
                int dataIdx = cursor.getColumnIndex(MediaStore.Files.FileColumns.DATA);

                while (cursor.moveToNext()) {
                    long id = cursor.getLong(idIdx);
                    String name = cursor.getString(nameIdx);
                    int mediaTypeInt = cursor.getInt(mediaTypeIdx);
                    String mimeType = cursor.getString(mimeIdx);
                    long sizeBytes = cursor.getLong(sizeIdx);
                    long dateModifiedSec = cursor.getLong(dateIdx);
                    String bucketName = cursor.getString(bucketNameIdx);
                    int width = widthIdx != -1 ? cursor.getInt(widthIdx) : 0;
                    int height = heightIdx != -1 ? cursor.getInt(heightIdx) : 0;
                    long durationMs = durationIdx != -1 ? cursor.getLong(durationIdx) : 0;
                    String filePath = dataIdx != -1 ? cursor.getString(dataIdx) : "";

                    boolean isVideo = (mediaTypeInt == MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO)
                        || (mimeType != null && mimeType.startsWith("video/"));

                    String type = isVideo ? "video" : "photo";

                    Uri contentUri = isVideo
                        ? ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, id)
                        : ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id);

                    String finalUrl = (filePath != null && !filePath.isEmpty()) ? filePath : contentUri.toString();
                    String thumbPath = getOrCreateThumbnailPath(id, contentUri, mediaTypeInt);

                    long timestamp = dateModifiedSec > 0 ? dateModifiedSec * 1000 : System.currentTimeMillis();
                    Date itemDate = new Date(timestamp);
                    String dateStr = dateFormat.format(itemDate);
                    String timeStr = timeFormat.format(itemDate);

                    double sizeMb = Math.round((sizeBytes / (1024.0 * 1024.0)) * 10.0) / 10.0;
                    if (sizeMb <= 0) sizeMb = 0.1;

                    if (name == null || name.isEmpty()) {
                        name = (isVideo ? "Video_" : "Photo_") + id;
                    }
                    if (bucketName == null || bucketName.isEmpty()) {
                        bucketName = "Camera";
                    }

                    JSObject itemObj = new JSObject();
                    itemObj.put("id", "media-" + id);
                    itemObj.put("title", name);
                    itemObj.put("type", type);
                    itemObj.put("url", finalUrl);
                    itemObj.put("thumbnailUrl", thumbPath);
                    itemObj.put("date", dateStr);
                    itemObj.put("time", timeStr);
                    itemObj.put("timestamp", timestamp);
                    itemObj.put("sizeMb", sizeMb);
                    itemObj.put("album", bucketName);
                    itemObj.put("mimeType", mimeType != null ? mimeType : (isVideo ? "video/mp4" : "image/jpeg"));
                    if (isVideo) {
                        itemObj.put("durationSec", Math.max(1, (int) (durationMs / 1000)));
                    }
                    if (width > 0) itemObj.put("width", width);
                    if (height > 0) itemObj.put("height", height);

                    itemsArray.put(itemObj);
                }
            }
        } catch (Exception e) {
            call.reject("Error querying media: " + e.getMessage());
            return;
        }

        JSObject res = new JSObject();
        res.put("items", itemsArray);
        call.resolve(res);
    }

    private String getOrCreateThumbnailPath(long id, Uri contentUri, int mediaType) {
        try {
            Context context = getContext();
            File cacheDir = new File(context.getCacheDir(), "thumbnails");
            if (!cacheDir.exists()) {
                cacheDir.mkdirs();
            }

            File thumbFile = new File(cacheDir, "thumb_" + id + ".jpg");
            if (thumbFile.exists() && thumbFile.length() > 0) {
                return thumbFile.getAbsolutePath();
            }

            Bitmap bitmap = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                try {
                    bitmap = context.getContentResolver().loadThumbnail(contentUri, new Size(320, 320), null);
                } catch (Exception ignored) {}
            }

            if (bitmap == null) {
                if (mediaType == MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO) {
                    bitmap = MediaStore.Video.Thumbnails.getThumbnail(
                        context.getContentResolver(),
                        id,
                        MediaStore.Video.Thumbnails.MINI_KIND,
                        null
                    );
                } else {
                    bitmap = MediaStore.Images.Thumbnails.getThumbnail(
                        context.getContentResolver(),
                        id,
                        MediaStore.Images.Thumbnails.MINI_KIND,
                        null
                    );
                }
            }

            if (bitmap != null) {
                try (FileOutputStream fos = new FileOutputStream(thumbFile)) {
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 80, fos);
                    fos.flush();
                }
                bitmap.recycle();
                return thumbFile.getAbsolutePath();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return contentUri.toString();
    }

    private static class AlbumHolder {
        String id;
        String name;
        int count;
        String coverUri;
    }
}
