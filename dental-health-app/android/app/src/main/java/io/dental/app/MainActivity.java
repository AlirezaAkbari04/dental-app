// In android/app/src/main/java/io/dental/app/MainActivity.java
package io.dental.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "DentalApp";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable WebView debugging
        WebView.setWebContentsDebuggingEnabled(true);
        Log.d(TAG, "WebView debugging enabled");
    }
}